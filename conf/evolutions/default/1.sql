# --- Created by Ebean DDL
# To stop Ebean DDL generation, remove this comment and start using Evolutions

# --- !Ups

create table thing (
  id                        bigint not null,
  name                      varchar(255),
  contenttype               varchar(255),
  content                   clob,
  cached_json               clob,
  constraint pk_thing primary key (id))
;

create sequence thing_seq;




# --- !Downs

SET REFERENTIAL_INTEGRITY FALSE;

drop table if exists thing;

SET REFERENTIAL_INTEGRITY TRUE;

drop sequence if exists thing_seq;

