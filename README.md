# Poké-info

Poké-info is een webapplicatie waarin gebruikers Pokémon-informatie kunnen bekijken en hun eigen collectie kunnen bijhouden.

## 🧱 Architectuur

De applicatie bestaat uit drie onderdelen:

- **Frontend:** React (Vite)
- **Backend:** ASP.NET Core Web API
- **Database:** MySQL

De frontend communiceert via HTTP met de backend.  
De backend verwerkt de requests en slaat gegevens op in de database via Entity Framework Core.

## ⚙️ Functionaliteiten (huidige versie)

- Pokémon-overzicht ophalen via externe API (PokéAPI)
- Pokémon details bekijken via popup
- Gebruikersregistratie (account aanmaken)
- Opslaan van gebruikers in MySQL database

## 🛠️ Technologieën

- React
- ASP.NET Core (.NET 8)
- Entity Framework Core
- MySQL
- DataGrip / MySQL Workbench

## 🚀 Installatie & starten

### Backend

1. Open het project in Visual Studio
2. Zorg dat MySQL draait
3. Controleer je connection string in `appsettings.Development.json`
4. Run het project (Swagger opent)

### Frontend

```bash
cd pokeinfo-client
npm install
npm run dev

Ga naar:
http://localhost:5173