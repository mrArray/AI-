import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { name: 'Overview', path: '/admin/overview' },
    { name: 'LLM Models', path: '/admin/llm-models' },
    { name: 'LLM Providers', path: '/admin/llm-providers' },
    { name: 'Prompt Templates', path: '/admin/prompt-templates' },
    { name: 'System Config', path: '/admin/system-config' },
    { name: 'Billing Packages', path: '/admin/billing-packages' },
  ];

  return (
    <div className="sidebar bg-gray-800 text-white w-64 h-full fixed">
      <div className="p-4 text-lg font-bold">Admin Panel</div>
      <ul className="menu-list">
        {menuItems.map((item) => (
          <li key={item.name} className="p-2 hover:bg-gray-700">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'text-blue-400' : 'text-white'
              }
            >
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
