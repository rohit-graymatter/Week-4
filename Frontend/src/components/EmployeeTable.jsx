import React from 'react';
import EmployeeRow from './EmployeeRow';

const EmployeeTable = ({ employees, handleEdit, handleDelete }) => (
  <div className="table-responsive">
    <table className="table table-striped table-hover table-bordered align-middle shadow-sm bg-white">
      <thead className="table-primary">
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {employees.length === 0 ? (
          <tr>
            <td colSpan="5" className="text-center text-muted py-4">
              No employees found
            </td>
          </tr>
        ) : (
          employees.map(emp => (
            <EmployeeRow
              key={emp._id}
              emp={emp}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default EmployeeTable;
