# Poké-info – Security Mitigation

## Inleiding

Deze README beschrijft de implementatie van een beveiligingsmaatregel binnen de Poké-info applicatie.  
Het doel is om aan te tonen hoe een specifieke bedreiging uit het threat model is gemitigeerd in de codebase.

---

## Gemitigeerde dreiging

**Threat ID:** 123  
**Naam:** Potential SQL Injection vulnerability  
**Categorie (STRIDE):** Tampering  

SQL Injection is een aanval waarbij kwaadaardige invoer wordt gebruikt om databasequeries te manipuleren. Dit kan leiden tot het uitlezen, aanpassen of verwijderen van data.

---

## Implementatie

De mitigatie is toegepast in:

`CollectionRepository.cs`

Binnen deze klasse wordt gebruik gemaakt van **parameterized queries / Entity Framework**, waardoor gebruikersinvoer nooit direct in SQL-queries wordt geplaatst.

Voorbeeld:

```csharp
var pokemon = _context.Pokemon
    .Where(p => p.Name == inputName)
    .FirstOrDefault();
```
## Waarom dit werkt

Door gebruik te maken van parameterized queries:

- Wordt invoer behandeld als data in plaats van code
- Kan de structuur van de query niet worden aangepast
- Wordt SQL Injection effectief voorkomen

## Conclusie
De dreiging #123 (SQL Injection) is succesvol gemitigeerd door veilige database-interactie toe te passen.
Hiermee wordt de kans op ongeautoriseerde toegang tot gegevens aanzienlijk verkleind.
