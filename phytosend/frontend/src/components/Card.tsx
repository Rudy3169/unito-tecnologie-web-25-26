function Card({name, scientificName, imgURL}: {name: string, scientificName: string, imgURL: string}) {
    return (
        <div className="card">
            <img src={imgURL} className="card-img-top" alt="Immagine Pianta" />
            <div className="card-body">
                <h5 className="card-name">{name}</h5>
                <p className="card-scientificname"><em>{scientificName}</em></p>
            </div>
        </div>
    )
}

export default Card;