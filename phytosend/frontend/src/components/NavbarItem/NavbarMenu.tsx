import Catalog from "../../catalog.tsx";

function NavbarMenu() {
    return (
        <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
            <li>
                <a href="../../home.tsx" className="home nav-link px-2 link-secondary">
                    Home
                </a>
            </li>
            <li>
                <a href="../../catalog.tsx" className="catalog nav-link px-2 link-dark">
                    Catalogo Verde
                </a>
            </li>
        </ul>
    )
}

export default NavbarMenu;