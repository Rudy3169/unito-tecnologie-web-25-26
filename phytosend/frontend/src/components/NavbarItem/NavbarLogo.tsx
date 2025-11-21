import Phytologo from "../../../public/logo.png";

function NavbarLogo() {
    return (
        <div id="div-logo">
            <a id="link-logo" href="/home" role="link">
                <img id="img-logo" src={Phytologo} alt="logo" height="40" width="40"/>
            </a>
        </div>
    )
}

export default NavbarLogo;