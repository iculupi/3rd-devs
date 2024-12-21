// Znajdź najkrótszą ścieżkę
MATCH p=shortestPath((start:User {name: "Rafał"})-[:KNOWS*]->(end:User {name: "Barbara"}))
RETURN [node in nodes(p) | node.name] as path; 