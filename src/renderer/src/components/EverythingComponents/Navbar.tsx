import React from "react";
import NavItem from "./NavItem";

const navItems = [
  { href: "/", label: "Everything" },
  { href: "/spaces", label: "Spaces" },
  { href: "/serendipity", label: "Serendipity" },
];

const Navbar: React.FC = () => {
  return (
    <div className="h-9 flex justify-end w-full font-nunito font-light text-lg text-[19px] pt-[10px]">
      {navItems.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
    </div>
  );
};

export default Navbar;
