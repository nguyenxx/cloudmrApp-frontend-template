import React, { useEffect, useState } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { APP_BUG_REPORT } from "../../../../Variables";
import { Container, Toolbar } from '@mui/material';
import { CmrLabel } from 'cloudmr-ux';

interface MenuItem {
    path: string
    title: string
}

const Header = ({ siteTitle, authentication, handleLogout, menuList }: {
    siteTitle: string,
    authentication: { email: string, accessToken: string }
    menuList: MenuItem[],
    handleLogout: () => void
}) => {
    const navigate = useNavigate();
    const currPath = navigate.name;
    const [menuSelect, setMenuSelect] = useState(siteTitle);
    const { email, accessToken } = authentication;
    console.log(authentication);

    useEffect(() => {
        for (let item of menuList) {
            console.log(item.path);
            console.log(currPath);
            if (item.path === currPath) setMenuSelect(item.title);
        }
    }, [currPath]);

    const handleMenuChange = (info: MenuItem, navigate: any) => {
        if (currPath === info.path) return;
        navigate(info.path);
        for (let item of menuList) {
            if (item.path === info.path) {
                setMenuSelect(item.title);
            }
        }
        return false;
    };

    return (
        <nav className="navbar navbar-expand-md navbar-dark bg-dark shadow-sm" style={{ background: '#390063', paddingTop: "10px", paddingBottom: "10px" }}>
            {/*add small-margin to className to align header content to the ends*/}
            {/* <div className="container-lg"> */}
            <Container maxWidth="lg">
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" className="navbar-brand">
                        <div style={{
                            // backgroundColor: 'white', 
                            // borderRadius: '30%',
                            width: '60px',
                            height: '60px',
                            marginRight: '30px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {/* Uncomment to display the app logo */}
                            {/* <img src={process.env.PUBLIC_URL + '/app_icon.ico'} alt="Logo" style={{ height: '40px', width: '40px' }} /> adjust height and width as needed */}
                            <CmrLabel>App Name</CmrLabel>
                        </div>
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarToggleExternalContent" aria-controls="navbarToggleExternalContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarToggleExternalContent">
                        {/* Left Side Of Navbar */}
                        <ul className="navbar-nav">
                            {menuList.map((menuItem) => {
                                return <li className={`nav-item${(menuItem.title == menuSelect) ? ' active' : ''}`} key={menuItem.path}>
                                    <a className='nav-link' style={{ cursor: 'pointer' }} onClick={(event) => {
                                        switch (menuItem.title) {
                                            case 'Bug Report':
                                                window.open(APP_BUG_REPORT)
                                                // window.location.href='https://github.com/cloudmrhub-com/mroptimum/issues';
                                                return;
                                        }
                                        event.preventDefault();
                                        handleMenuChange(menuItem, navigate)
                                    }} >
                                        {menuItem.title}
                                    </a>
                                </li>;
                            })}
                        </ul>

                        {/**Right Side Of Navbar **/}
                        {authentication.accessToken != '' && (
                            <ul className="navbar-nav ms-auto">
                                {/** Authentication Links **/}
                                <li className="nav-item dropdown">
                                    <button className="nav-link  dropdown-toggle" type="button"
                                        id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                                        {email} <span className="caret"></span>
                                    </button>
                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        <li><button className="dropdown-item"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                handleLogout();
                                            }}>
                                            Logout
                                        </button></li>
                                    </ul>
                                </li>
                            </ul>)}
                    </div>
                </Toolbar>
            </Container>
            {/* </div> */}
        </nav>
    );
};

export default Header;
export type { MenuItem };

