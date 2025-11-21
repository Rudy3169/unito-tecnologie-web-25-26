import NavbarLogo from "./NavbarItem/NavbarLogo.tsx";
import NavbarSearch from "./NavbarItem/NavbarSearch.tsx";
import NavbarIcon from "./NavbarItem/NavbarIcon.tsx";
import NavbarProfile from "./NavbarItem/NavbarProfile.tsx";
import NavbarMenu from "./NavbarItem/NavbarMenu.tsx";

function Navbar () {
    return (
        <div className="container">
            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                <NavbarLogo></NavbarLogo>
                <NavbarSearch></NavbarSearch>
                <NavbarMenu></NavbarMenu>
                <NavbarIcon></NavbarIcon>
                <NavbarProfile></NavbarProfile>
            </div>
        </div>
    )
}

export default Navbar;