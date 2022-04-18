-- Tables for User Details
CREATE TABLE user_details (
    user_id serial PRIMARY KEY, 
    username VARCHAR ( 255 ) UNIQUE NOT NULL, 
    name VARCHAR(255) , 
    gitToken VARCHAR ( 255 ) NOT NULL, 
    key VARCHAR(255) UNIQUE, 
    email VARCHAR ( 255 ) UNIQUE, 
    created_at TIMESTAMP NOT NULL DEFAULT now(), 
    recent_login_at TIMESTAMP NOT NULL
);

-- Table for Deployment Details
CREATE TABLE deployment_details (
    id serial PRIMARY KEY, 
	name VARCHAR ( 255 ) UNIQUE NOT NULL,
	recent_update_at TIMESTAMP NOT NULL
);

-- Table for Kit Details
CREATE TABLE kit_details(
    id serial PRIMARY KEY,
	name VARCHAR( 255 ) NOT NULL,
	version VARCHAR( 255 ) NOT NULL,
	deployment_id int NOT NULL,
	deployed_by VARCHAR( 255 ),
	deployed_at VARCHAR( 255 ) NOT NULL,
	features VARCHAR( 255 ),
	is_dev INT,
	recent_update_at TIMESTAMP NOT NULL,
	UNIQUE (name, deployment_id),
	CONSTRAINT fk_kit_deployment
		FOREIGN KEY ( deployment_id )
		REFERENCES deployment_details ( id )
);

