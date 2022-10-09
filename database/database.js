const  knex  =require("knex")( { 
    client : 'mysql', 
    connection : { 
    host : 'localhost' , 
    user : 'root' , 
    password : '123456' , 
    database : 'kevin' 
  } 
} ) ; 

/*
knex.schema.hasTable('cliente').then(function(exists) { // verifica se já existe a tabela 
    if (!exists) { // se não existe cria
      return knex.schema.createTable('cliente', function(t) {
        t.increments('id').primary();
        t.string('cpf', 100).notNullable();
        t.string('nome', 100).notNullable();
        t.text('endereço').notNullable();
      });
    }
  })

  */


  knex.schema.hasTable('usuario').then(function(exists) { // verifica se já existe a tabela 
    if (!exists) { // se não existe cria
      return knex.schema.createTable('usuario', function(t) {
        t.increments('id').primary();
        t.string('email', 100).notNullable();
        t.text('senha').notNullable();
        t.text('token').notNullable();
      });
    }
  })


  
module.exports = knex;