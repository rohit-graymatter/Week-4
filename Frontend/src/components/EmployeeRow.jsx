import React from 'react';
import Swal from 'sweetalert2';

const EmployeeRow = ({ emp, handleEdit, handleDelete }) => {
  const confirmDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the employee.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) handleDelete(emp);
    });
  };

  return (
    <tr>
      <td style={{ fontFamily: 'monospace' }}>{emp._id}</td>
      <td>{emp.name}</td>
      <td>{emp.email}</td>
      <td>{emp.department}</td>
      <td>
        <button className="btn btn-success btn-sm me-2" onClick={() => handleEdit(emp)}>
          Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={confirmDelete}>
          Delete
        </button>
      </td>
    </tr>
  );
};

export default EmployeeRow;
