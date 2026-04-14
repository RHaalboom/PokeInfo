# Poké-info

Poké-info is een webapplicatie waarmee gebruikers Pokémon-informatie kunnen bekijken en hun eigen collectie kunnen bijhouden.

## Technologieën

Frontend:
- React (Vite)
- HTML, CSS, JavaScript

Backend:
- ASP.NET Core Web API
- C#

Database:
- MySQL
- DataGrip

## Functionaliteiten (huidig)

- Pokémon-overzicht bekijken
- Pokémon details bekijken via popup
- Data ophalen via externe API (PokéAPI)

## Architectuur

Frontend (React) communiceert via HTTP met de backend (ASP.NET API).  
De backend haalt data op uit de PokéAPI en (later) uit een MySQL database.

## Installatie

### Backend
Open in Visual Studio en run het project.

### Frontend
cd pokeinfo-client
npm install
npm run dev