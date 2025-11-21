import "./styles/home.css";
import Navbar from "./components/Navbar.tsx";
import Card from "./components/Card.tsx";

function Catalog() {
    const plants = [
        {
            id: 0,
            name: "Rosa Cinese",
            scientificName: "Rosa chinensis",
            imgURL:
                "https://xslib-img.picturethisai.com/prod/sims/0/7867/eda62e7acc6ff2c450e6f729aac2499f4316fa56.jpg?x-oss-process=image/format,webp/resize,s_280&v=1.3"
        },
        {
            id: 1,
            name: "Ortensia",
            scientificName: "Hydrangea macrophylla",
            imgURL:
                "https://xslib-img.picturethisai.com/prod/sims/0/7867/40c1736a875aece195bde5143dd23c5f9ef1cf41.jpg?x-oss-process=image/format,webp/resize,s_280&v=1.3"
        },
        {
            id: 2,
            name: "Ibisco Cinese",
            scientificName: "Hibiscus rosa-sinensis",
            imgURL:
                "https://xslib-img.picturethisai.com/prod/sims/0/7870/a752075a4b9b82b17dad17d4253dea4c7092f42a.jpg?x-oss-process=image/format,webp/resize,s_280&v=1.3"
        },
        {
            id: 3,
            name: "Camelia",
            scientificName: "Camellia japonica",
            imgURL:
                "https://xslib-img.picturethisai.com/prod/imgs/0/7876/44bb43a33f4428607c5de2106e54c198d8ab2b64.jpg?x-oss-process=image/format,webp/resize,s_280&v=1.3"
        },
    ];
    return (
        <header className="header p-3 mb-3 border-bottom">
            <Navbar></Navbar>
            {plants.map((plant) =>(
                <Card
                    key={plant.id}
                    name={plant.name}
                    scientificName={plant.scientificName}
                    imgURL={plant.imgURL}>
                </Card>
            ))}
        </header>
    );
}

export default Catalog;