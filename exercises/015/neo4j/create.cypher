// Wyczyść bazę
MATCH (n) DETACH DELETE n;

// Stwórz indeksy
CREATE INDEX user_id IF NOT EXISTS FOR (u:User) ON (u.id);
CREATE INDEX user_name IF NOT EXISTS FOR (u:User) ON (u.name);

// Stwórz węzły dla użytkowników
UNWIND $users AS user
CREATE (u:User {id: user.id, name: user.username});

// Stwórz relacje
UNWIND $connections AS conn
MATCH (u1:User {id: conn.user1_id}), (u2:User {id: conn.user2_id})
CREATE (u1)-[:KNOWS]->(u2); 