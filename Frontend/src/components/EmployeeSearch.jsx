import React from 'react';

const EmployeeSearch = ({ searchId, onChange, onSearch, onClear, isSearching }) => (
  <form onSubmit={onSearch} className="row g-2 mb-4 justify-content-center">
    <div className="col-auto">
      <input
        type="text"
        placeholder="Search by ID"
        value={searchId}
        onChange={onChange}
        className="form-control"
      />
    </div>
    <div className="col-auto">
      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </div>
    {isSearching && (
      <div className="col-auto">
        <button type="button" onClick={onClear} className="btn btn-secondary">
          Clear
        </button>
      </div>
    )}
  </form>
);

export default EmployeeSearch;
