'use client'

import React from 'react';

import { cn } from '../../lib/utils';

interface NavItemProps {
  href: string;
  label: string;
}

const getBasePath = (path: string) => {
  const segments = path.split('/');
  return segments.length > 1 ? `/${segments[1]}` : path;
};

const NavItem: React.FC<NavItemProps> = ({ href, label }) => {

  // const isActive = getBasePath(pathname) === getBasePath(href);
  const isActive = false;
  return (
    <div className="relative">
      <div
        className={cn(
          'absolute top-[-50px] right-[-20px] bg-[#ff5924] h-[45px] w-[calc(100%+10px)] rounded-b-[20px] z-10 transition-all duration-300',
          isActive ? 'opacity-100' : 'opacity-0'
        )}
      ></div>
      <a href={href} className={cn('ml-[30px] cursor-pointer', isActive ? 'text-[#cee2ff]' : 'text-[#748297]')}>
        {label}
      </a>
    </div>
  );
};

export default NavItem;
