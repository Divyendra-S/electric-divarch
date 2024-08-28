import React from 'react'
import NavItem from './NavItem'

const navItems = [
  { id: 1, label: 'Everything' },
  { id: 2, label: 'Spaces' },
  { id: 3, label: 'Serendipity' }
]
// type NavbarProps = {
//   setNavId: React.Dispatch<React.SetStateAction<number>>,
//   navId: number;
// }
const Navbar = ({ setNavId,navId }) => {
  return (
    <div className="h-9 flex justify-end w-full font-nunito font-light text-lg text-[19px] pt-[10px]">
      {navItems.map((item) => (
        <NavItem key={item.id} {...item} setNavId={setNavId} navId={navId} />
      ))}
    </div>
  )
}

export default Navbar
