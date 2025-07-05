import React, { useEffect, useState } from 'react';
import supabase from './supabaseClient';

function UserManager({ refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('username, counter')
        .order('username', { ascending: true });

      if (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } else {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [refreshTrigger]); // now refetches whenever this changes


  if (loading) return <p style={{ marginTop: '40px' }}>Loading users...</p>;
  if (users.length === 0) return <p style={{ marginTop: '40px' }}>No users found.</p>;

  return (
    <div style={{ marginTop: '40px' }}>
      <h2>📋 All Users and Their Counters</h2>
      <table style={{
        margin: '0 auto',
        borderCollapse: 'collapse',
        width: '60%',
        fontFamily: 'Arial, sans-serif'
      }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Username</th>
            <th style={tableHeaderStyle}>Counter</th>
          </tr>
        </thead>
        <tbody>
          {users.map(({ username, counter }) => (
            <tr key={username}>
              <td style={tableCellStyle}>{username}</td>
              <td style={tableCellStyle}>{counter}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableHeaderStyle = {
  backgroundColor: '#f2f2f2',
  padding: '10px',
  borderBottom: '2px solid #ddd',
  textAlign: 'left'
};

const tableCellStyle = {
  padding: '8px 12px',
  borderBottom: '1px solid #ddd'
};

export default UserManager;
