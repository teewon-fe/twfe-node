CREATE TABLE tw_user (
	id serial PRIMARY KEY,
	user_name varchar(20) UNIQUE NOT NULL,
	user_group integer REFERENCES tw_group(id), 
	user_password varchar(60) NOT NULL,
	mobile varchar(11) UNIQUE NOT NULL,
	create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
	update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
)