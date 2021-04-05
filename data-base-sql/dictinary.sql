CREATE TABLE project_type (
	id serial PRIMARY KEY,
	type_name varchar(50) UNIQUE NOT NULL,
	remark varchar(300),
	create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
	update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
);

ALTER SEQUENCE project_type_id_seq RESTART WITH 1;

INSERT INTO project_type(type_name)
VALUES('前端项目');


CREATE TABLE project_framwork (
	id serial PRIMARY KEY,
	framwork_name varchar(50) UNIQUE NOT NULL,
	remark varchar(300),
	create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
	update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
);

ALTER SEQUENCE project_framwork_id_seq RESTART WITH 1;

INSERT INTO project_framwork(framwork_name)
VALUES('前台门户类应用'),('后台管理类应用'),('移动端应用'),('PC与移动端混合应用'),('类ECO(深色)风格应用');

CREATE TABLE project_dev_mode (
	id serial PRIMARY KEY,
	dev_mod_name varchar(50) UNIQUE NOT NULL,
	remark varchar(300),
	create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
	update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
);

ALTER SEQUENCE project_dev_mode_id_seq RESTART WITH 1;

INSERT INTO project_dev_mode(dev_mod_name)
VALUES('前后端分离'),('前后端分离-样式页'),('html纯样式页');

CREATE TABLE issues (
	id serial PRIMARY KEY,
	descript varchar(2000) UNIQUE NOT NULL,
	type varchar(30) DEFAULT 'bug',
	create_developer_id INTEGER NOT NULL,
	create_developer varchar(30) NOT NULL,
	handle_developer varchar(30),
	resolve_time TIMESTAMP,
	status varchar(30) DEFAULT 'doing',
	remark varchar(300),
	create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
	update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
);