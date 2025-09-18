import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSearch, FaChevronDown, FaChevronUp, FaUser, FaUserTie } from 'react-icons/fa';
import styles from './UserAndRoleSelection.module.css';
import { fetchRoles } from '../../../actions/authAction';

const EMPTY_ARR = Object.freeze([]);

const UserAndRoleSelection = ({ newKpi, setNewKpi, employees }) => {
  const dispatch = useDispatch();
  const [userSearch, setUserSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [expandedSection, setExpandedSection] = useState({ users: true, roles: true });

  // Get roles from Redux store
  const rolesState = useSelector((state) => state.roles);
  const rolesLoading = rolesState?.loading || false;
  const rolesError = rolesState?.error || null;

  // ✅ Memoize roles so its reference is stable
  const roles = useMemo(() => {
    const raw = rolesState?.roles?.data;
    return Array.isArray(raw) ? raw : EMPTY_ARR;
  }, [rolesState]);

  // Fetch roles when component mounts
  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  // Safe string conversion for search
  const safeString = (value) => (value || '').toString().toLowerCase();

  // Filter employees: exclude Super Admins and then apply search
  const filteredEmployees = useMemo(() => {
    const searchTerm = safeString(userSearch);
    return employees
      .filter((emp) => emp.role !== 'Super Admin')
      .filter((emp) => {
        const name = safeString(emp.username || emp.fullName || emp.email);
        const role = safeString(emp.role);
        return name.includes(searchTerm) || role.includes(searchTerm);
      });
  }, [employees, userSearch]);

  // Filter roles based on search
  const filteredRoles = useMemo(() => {
    const searchTerm = safeString(roleSearch);
    // Handle either string roles or objects with a 'name' field
    return roles
      .map((r) => (typeof r === 'string' ? r : r?.name ?? ''))
      .filter((r) => safeString(r).includes(searchTerm));
  }, [roles, roleSearch]);

  const handleUserCheckboxChange = (e) => {
    const userId = e.target.value;
    setNewKpi((prev) => ({
      ...prev,
      assignedUsers: e.target.checked
        ? [...prev.assignedUsers, userId]
        : prev.assignedUsers.filter((id) => id !== userId),
    }));
  };

  const handleRoleCheckboxChange = (e) => {
    const role = e.target.value;
    setNewKpi((prev) => ({
      ...prev,
      assignedRoles: e.target.checked
        ? [...prev.assignedRoles, role]
        : prev.assignedRoles.filter((r) => r !== role),
    }));
  };

  const toggleSection = (section) => {
    setExpandedSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Get display name for employee (username > fullName > email > 'Unknown User')
  const getDisplayName = (emp) => emp.username || emp.fullName || emp.email || 'Unknown User';

  return (
    <div className={styles.container}>
      {/* Users Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('users')}>
          <FaUser className={styles.sectionIcon} />
          <h3>Assign Individual Users</h3>
          <span className={styles.toggleIcon}>
            {expandedSection.users ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>
        {expandedSection.users && (
          <div className={styles.sectionContent}>
            <div className={styles.searchContainer}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.scrollContainer}>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <div key={emp._id} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id={`emp-${emp._id}`}
                      value={emp._id}
                      checked={newKpi.assignedUsers.includes(emp._id)}
                      onChange={handleUserCheckboxChange}
                      className={styles.checkbox}
                    />
                    <label htmlFor={`emp-${emp._id}`} className={styles.label}>
                      <span className={styles.userName}>{getDisplayName(emp)}</span>
                      <span className={styles.userRole}>{emp.role || 'No role'}</span>
                    </label>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>No users found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Roles Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('roles')}>
          <FaUserTie className={styles.sectionIcon} />
          <h3>Assign By Role</h3>
          <span className={styles.toggleIcon}>
            {expandedSection.roles ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>
        {expandedSection.roles && (
          <div className={styles.sectionContent}>
            <div className={styles.searchContainer}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search roles..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.scrollContainer}>
              {rolesLoading ? (
                <div className={styles.loading}>Loading roles...</div>
              ) : rolesError ? (
                <div className={styles.error}>Error loading roles: {String(rolesError)}</div>
              ) : filteredRoles.length > 0 ? (
                filteredRoles.map((roleName, index) => (
                  <div key={index} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id={`role-${index}`}
                      value={roleName}
                      checked={newKpi.assignedRoles.includes(roleName)}
                      onChange={handleRoleCheckboxChange}
                      className={styles.checkbox}
                    />
                    <label htmlFor={`role-${index}`} className={styles.label}>
                      {roleName}
                    </label>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>No roles found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAndRoleSelection;
