import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../state/authStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building, 
  Mail, 
  MapPin,
  UserCheck,
  UserX,
  Database,
  Activity
} from 'lucide-react';

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
  const [stats, setStats] = useState({
    totalRequests: 0,
    approvedToday: 0,
    rejectedToday: 0,
    pendingRequests: 0
  });
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
        const requestsData = res.data.data;
        setRequests(requestsData);
        
        // Calculate stats
        setStats({
          totalRequests: requestsData.length,
          approvedToday: 0, // You can calculate this based on actual data
          rejectedToday: 0,  // You can calculate this based on actual data
          pendingRequests: requestsData.filter((r: AdminRequest) => r.status === 'pending').length
        });
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
      toast.success('Request approved successfully');
      setRequests(prev => prev.filter(r => r.id !== id));
      setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests - 1, approvedToday: prev.approvedToday + 1 }));
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
      setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests - 1, rejectedToday: prev.rejectedToday + 1 }));
    } catch (err) {
      console.error('Rejection failed', err);
      toast.error('Failed to reject request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-orange-600 animate-pulse" />
          </div>
          <p className="text-xl text-gray-600">Loading admin requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full mb-4">
            <Shield className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-800 font-semibold">सुपर एडमिन पैनल | Super Admin Panel</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
            <span className="text-orange-600">एडमिन</span>
            <br />
            <span className="text-green-600">प्रबंधन केंद्र</span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Admin Registration Requests Management Dashboard
          </p>
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-2xl p-6 text-white mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">आज का डैशबोर्ड | Today's Dashboard</h2>
            <p className="text-lg opacity-90">Admin requests overview</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-3xl font-bold mb-2">{stats.totalRequests}</div>
              <div className="text-sm opacity-90">कुल अनुरोध | Total Requests</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-3xl font-bold mb-2">{stats.pendingRequests}</div>
              <div className="text-sm opacity-90">लंबित | Pending</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-3xl font-bold mb-2">{stats.approvedToday}</div>
              <div className="text-sm opacity-90">स्वीकृत | Approved</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-3xl font-bold mb-2">{stats.rejectedToday}</div>
              <div className="text-sm opacity-90">अस्वीकृत | Rejected</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Database className="w-6 h-6 text-orange-600 mr-2" />
              लंबित एडमिन पंजीकरण अनुरोध | Pending Admin Registration Requests
            </h2>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">कोई लंबित अनुरोध नहीं</h3>
              <p className="text-gray-600">No pending admin registration requests at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg transition duration-300 bg-gradient-to-r from-white to-gray-50">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                          <Users className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{req.user.user_name}</h3>
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-4 h-4 mr-1" />
                            {req.user.user_email}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 ml-16">
                        <div className="flex items-center text-gray-700">
                          <Building className="w-4 h-4 mr-2 text-orange-500" />
                          <div>
                            <div className="text-sm font-medium">Organization</div>
                            <div className="text-sm">{req.org_name}</div>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Shield className="w-4 h-4 mr-2 text-green-500" />
                          <div>
                            <div className="text-sm font-medium">Type</div>
                            <div className="text-sm">{req.org_type}</div>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                          <div>
                            <div className="text-sm font-medium">Location</div>
                            <div className="text-sm">{req.org_location}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition duration-300 flex items-center"
                      >
                        <UserCheck className="w-5 h-5 mr-2" />
                        स्वीकार करें | Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition duration-300 flex items-center"
                      >
                        <UserX className="w-5 h-5 mr-2" />
                        अस्वीकार करें | Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-orange-500 hover:shadow-xl transition duration-300">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">उपयोगकर्ता प्रबंधन</h3>
            <p className="text-gray-600 text-sm">Manage all registered users and their permissions</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-green-500 hover:shadow-xl transition duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">डेटा ओवरव्यू</h3>
            <p className="text-gray-600 text-sm">View comprehensive system analytics and reports</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-blue-500 hover:shadow-xl transition duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">सिस्टम मॉनिटरिंग</h3>
            <p className="text-gray-600 text-sm">Monitor system health and performance metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;