import Header from "../components/content/Header.tsx";
import {Outlet} from "react-router-dom";
import './MainLayout.scss'

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Header/>
            <main className='main-layout__content'>
                <Outlet/>
            </main>
        </div>
    );
};

export default MainLayout;
