import React from 'react';
import Avatar from 'react-avatar';
import './Client.css';

// Generate consistent color from username
const getUserColor = (username) => {
  const colors = [
    '#ef4444', // red
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
  ];
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

function Client({ username }) {
  const userColor = getUserColor(username);

  return (
    <div className="member-item" style={{ borderLeftColor: userColor }}>
      <div className="d-flex align-items-center">
        <Avatar
          name={username.toString()}
          size={35}
          round="50%"
          className="mr-2"
          color={userColor}
        />
        <span className='mx-2 flex-grow-1'>{username.toString()}</span>
        <span
          className="status-dot"
          style={{ background: userColor }}
          title="Online"
        ></span>
      </div>
    </div>
  );
}

export default Client;
