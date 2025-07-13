import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../state/authStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface AdminRequest {
  id: string;
  org_name: string;
  org_type: string;
  org_location: string;
  status: string;
  user: {
    id: string;
    user_name: string;
    user_email: string;
  };
}

const isTokenValid = (token: string): boolean => {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const SuperAdminDashboard = () => {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      if (!token || !isTokenValid(token)) {
        clearAuth();
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('/api/v1/superadmin/admin-requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data.data);
      } catch (err) {
        console.error('Failed to fetch admin requests', err);
        toast.error('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token, clearAuth, navigate]);

  const handleApprove = async (id: string) => {
    try {
      await axios.post(`/api/v1/superadmin/admin-requests/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Request approved');
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Approval failed', err);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.post(`/api/v1/superadmin/admin-requests/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info('Request rejected');
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Rejection failed', err);
      toast.error('Failed to reject request');
    }
  };

  if (loading) return <p className="p-4 text-gray-600">Loading requests...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Pending Admin Registration Requests</h1>
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending requests.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map(req => (
            <li key={req.id} className="border p-4 rounded shadow-sm flex justify-between items-center">
              <div>
                <p><strong>{req.user.user_name}</strong> ({req.user.user_email})</p>
                <p className="text-sm text-gray-500">{req.org_name} - {req.org_type} - {req.org_location}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleApprove(req.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
