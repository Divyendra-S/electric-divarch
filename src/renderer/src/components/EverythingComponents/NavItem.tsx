'use client'

import React from 'react';

import { cn } from '../../lib/utils';

interface NavItemProps {
  id: number;
  label: string;
  setNavId: React.Dispatch<React.SetStateAction<number>>;
  navId: number;
}

// const getBasePath = (path: string) => {
//   const segments = path.split('/');
//   return segments.length > 1 ? `/${segments[1]}` : path;
// };

const NavItem: React.FC<NavItemProps> = ({ 
  id, label, setNavId, navId }) => {

  // const isActive = getBasePath(pathname) === getBasePath(href);
  const isActive = navId == id;
  return (
    <div className="relative">
      <div
        className={cn(
          'absolute top-[-50px] right-[-20px] bg-[#ff5924] h-[45px] w-[calc(100%+10px)] rounded-b-[20px] z-10 transition-all duration-300',
          isActive ? 'opacity-100' : 'opacity-0'
        )}
      ></div>
      <span onClick={() => {
        setNavId(id);
      }}  className={cn('ml-[30px] cursor-pointer', isActive ? 'text-[#cee2ff]' : 'text-[#748297]')}>
        {label}
      </span>
    </div>
  );
};

export default NavItem;
