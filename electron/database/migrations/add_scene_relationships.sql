-- Scene Relationships table (connections between scenes)
CREATE TABLE IF NOT EXISTS scene_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    scene1_id INTEGER NOT NULL,
    scene2_id INTEGER NOT NULL,
    relationship_type TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (scene1_id) REFERENCES scenes(id) ON DELETE CASCADE,
    FOREIGN KEY (scene2_id) REFERENCES scenes(id) ON DELETE CASCADE,
    UNIQUE(scene1_id, scene2_id)
);

-- Scene Positions table (for graph layout)
CREATE TABLE IF NOT EXISTS scene_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    x REAL NOT NULL,
    y REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE(scene_id)
);