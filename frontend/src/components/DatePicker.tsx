import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

const CalendarPicker: React.FC<Props> = ({ selectedDate, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block font-semibold mb-2">Select Date:</label>
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        dateFormat="yyyy-MM-dd"
        className="p-2 border rounded"
      />
    </div>
  );
};

export default CalendarPicker;
