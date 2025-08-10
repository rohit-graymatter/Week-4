import React from 'react';

const EmployeeForm = ({ form, editData, handleChange, handleSubmit, onCancel }) => {
  return (
    <form onSubmit={handleSubmit} className="row g-3 mb-4 justify-content-center">
      <div className="col-md-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="col-md-3">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="col-md-3">
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={form.department}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="col-md-auto d-flex gap-2">
        <button type="submit" className="btn btn-primary">
          {editData ? 'Update' : 'Add'}
        </button>
        {editData && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default EmployeeForm;
