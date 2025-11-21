function NavbarSearch() {
    return (
        <form className="col-lg-auto mb-3 mb-lg-0 me-lg-3" role="search">
            <input
                type="search"
                className="form-control"
                placeholder="Cerca..."
                aria-label="Search"
            />
        </form>
    )
}

export default NavbarSearch;