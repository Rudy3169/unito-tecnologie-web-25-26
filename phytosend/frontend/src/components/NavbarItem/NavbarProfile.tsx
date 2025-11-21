function NavbarProfile() {
    return(
        <div className="profile text-end">
            <a
                className="profilephoto d-block link-dark text-decoration-none dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <img
                    src="https://github.com/mdo.png"
                    alt="mdo"
                    width="32"
                    height="32"
                    className="rounded-circle"
                />
            </a>
            <ul className="dropdown-menu text-small">
                <li>
                    <a className="profile dropdown-item" href="/profile">
                        Profilo
                    </a>
                </li>
                <li>
                    <a className="garden dropdown-item" href="/garden">
                        Il mio Giardino
                    </a>
                </li>
                <li>
                    <a className="settings dropdown-item" href="/settings">
                        Impostazioni
                    </a>
                </li>
                <li>
                    <hr className="dropdown-divider" />
                </li>
                <li>
                    <a className="logout dropdown-item" href="/login">
                        Esci
                    </a>
                </li>
            </ul>
        </div>
    )
}

export default NavbarProfile;