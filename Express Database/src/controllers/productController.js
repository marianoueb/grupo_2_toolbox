const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const { query } = require('express');
const { validationResult } = require("express-validator")

module.exports = {
    index: async (req, res) => {
        let productos = await db.Product.findAll({
                include: [
                    {association: "Brand"},
                    {association: "Categories"}
                ]})
            .then(products => { return products })
            .catch(error => console.log(error))
        
        let search = {
            status: false,
            category: false,
            categoryParam: undefined,
            brand: false,
            brandParam: undefined,
            query: false
        }

        let marcas = await db.Brand.findAll()
            .then(brands => { return brands })
            .catch(error => console.log(error));

        let categorias = await db.Category.findAll()
            .then(cat => { return cat})
            .catch(error => { console.log(error);})

        res.render('product/list', {
            list: productos,
            brands: marcas,
            cats: categorias,
            title: "Productos",
            viewCat: "products",
            style: "list.css", 
            listTitle: "Listado de productos",
            search: search
        })
    },
    show: async (req, res) => {
        let products = await db.Product.findAll({
            include: [
                {association: "Brand"},
                {association: "Categories"}
            ]})
            .then(productos => { return productos })
            .catch(error => console.log(error));

        let selected = await db.Product.findByPk(req.params.id,{
            include: [
                {association: "Brand"},
                {association: "Categories"}
            ]})
            .then(producto => { return producto })
            .catch(error => console.log(error));

        res.render("product/detail",{
            list: products,
            product: selected,
            title: "Detalle del producto",
            viewCat: "products",
            style: "productDetails.css"
        })
    },
    create: async (req,res) => {
        let marcas = await db.Brand.findAll()
            .then(brands => { return brands })
            .catch(error => console.log(error));

        let categorias = await db.Category.findAll()
            .then(cat => { return cat})
            .catch(error => { console.log(error);})

        res.render("product/create",{
        title: "Crear un producto",
        marcas: marcas,
        categorias: categorias,
        viewCat: "products",
        style: "createProduct.css",
        backErrors: 0
    })
    },
    save: async (req,res) => {
        let marcas = await db.Brand.findAll()
            .then(brands => { return brands })
            .catch(error => console.log(error));

        let categorias = await db.Category.findAll()
            .then(cat => { return cat})
            .catch(error => { console.log(error);})

        const results = validationResult(req) 
        if (results.errors.length > 0) { 
            res.render("product/create",{
                title: "Crear un producto",
                marcas: marcas,
                categorias: categorias,
                viewCat: "products",
                style: "createProduct.css",
                backErrors: results.errors
            })
        } else {
            db.Product.create({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                brand_id: req.body.brand,
                category_id: req.body.category,
                image: req.file.filename 
            })
            res.redirect("/product/")
        }
    },
    edit: async (req,res) => {
        let marcas = await db.Brand.findAll()
            .then(brands => { return brands })
            .catch(error => console.log(error));

        let categorias = await db.Category.findAll()
            .then(cat => { return cat})
            .catch(error => { console.log(error);})

        let id = req.params.id;
        let selected = await db.Product.findByPk(id,{
            include: [
                {association: "Brand"},
                {association: "Categories"}
            ]})
            .then(producto => { return producto })
            .catch(error => console.log(error));
        res.render("product/edit",{
            title: "Editar el producto",
            marcas: marcas,
            categorias: categorias,
            viewCat: "products",
            style: "createProduct.css",
            product: selected,
            backErrors: 0
        })
    },
    update: async (req,res) =>{
        let marcas = await db.Brand.findAll()
            .then(brands => { return brands })
            .catch(error => console.log(error));

        let categorias = await db.Category.findAll()
            .then(cat => { return cat})
            .catch(error => { console.log(error);})

        let id = req.params.id;
        let selected = await db.Product.findByPk(id,{
            include: [
                {association: "Brand"},
                {association: "Categories"}
            ]})
            .then(producto => { return producto })
            .catch(error => console.log(error));
            
        const results = validationResult(req) 
        console.log(results);
        if (results.errors.length > 0) { 
            res.render("product/edit",{
                title: "Editar el producto",
            marcas: marcas,
            categorias: categorias,
            viewCat: "products",
            style: "createProduct.css",
            product: selected,
            backErrors: results.errors
            })
        } else {
            db.Product.update({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                brand_id: req.body.brand,
                category_id: req.body.category,
                image: req.file.filename 
            },{
                where: {
                    id: req.params.id
                }
            })
            res.redirect("/product/" + req.params.id)
            }

    },
    delete: (req,res) => {
        db.Product.destroy({
            where: {
                id: req.params.id
            }
        })
        res.redirect("/product/")
    },
    filter: async (req, res) => {
        // Creo filtro de busqueda con 3 parametros de busqueda (por marca, por categoria o por query string)
        // El valor importante de aqu?? en adelante es search.status
        let search = {
            status: false,
            category: false,
            categoryParam: undefined,
            brand: false,
            brandParam: undefined,
            query: false
        }
        
        if(req.body.brand > 0){ // Si hay marca en el filtro
            search.status = true // search.status indica que se est?? buscando algo
            search.brand = true // La segunda linea indica que caracteristica se est?? buscando
            search.brandParam = req.body.brand // Le damos el valor de la marca que se est?? buscando
        }
        if(req.body.category > 0){ // Si hay categor??a en el filtro
            search.status = true // search.status indica que se est?? buscando algo
            search.category = true // La segunda linea indica que caracteristica se est?? buscando
            search.categoryParam = req.body.category // Le damos el valor de la categor??a que se est?? buscando
        }
        if(req.query.search != undefined){ // Si se lleg?? a buscar por string en el filtro
            search.status = true // search.status indica que se est?? buscando algo
            search.query = true // La segunda linea indica que caracteristica se est?? buscando
        }
        
        // Ahora invocamos la lista predeterminada de elementos (ser?? usada para filtrar y si no se busca nada tambi??n)
        let lista = await db.Product.findAll({
            include: [
                {association: "Brand"},
                {association: "Categories"}
            ]})
            .then(products => { 
                filtro = products
                return products 
            })
            .catch(error => console.log(error));
        
        // Si el filtro no da resultados, la lista se guardar?? en una variable que ocupar?? su lugar
        let def = lista

        // Listado de marcas para filtrar luego
        let marcas = await db.Brand.findAll()
            .then(brands => { return brands })
            .catch(error => console.log(error));
        
        // Listado de categor??as para filtrar luego
        let categorias = await db.Category.findAll()
            .then(cat => { return cat})
            .catch(error => { console.log(error);})
        
        // Si se est?? buscando una marca, traemos los productos filtrando por su ID de marca
        if (search.brand == true) {
            lista = lista.filter(producto => producto.brand_id == search.brandParam) // N??tese que se aplica sobre "lista" el resultado
        }

        // Si se busca por categor??a, se filtrar??n por su ID de categor??a
        if (search.category == true) {
            lista = lista.filter(producto => producto.category_id == search.categoryParam)
        }
 
        // Creamos un t??tulo para llevarle a la vista de forma din??mica
        let titulo = "Listado de productos"

        // Si estamos buscando algo, el t??tulo de la vista ser?? distinto
        if (search.status == true) {
            titulo = "Resultado de la busqueda"
        }

        // Si nuestra variable lista pas?? por los filtros y no arroj?? ningun resultado
        // Le renovaremos el contenido con un t??tulo mostrando el problema
        if (lista.length == 0) {
            titulo = "No se han encontrado resultados"
            lista = def
        }

        // Paso final, mostramos la vista habiendo pasado todo el filtro
        res.render('product/list', {
            list: lista,
            brands: marcas,
            cats: categorias,
            title: "Resultado de la busqueda",
            viewCat: "products",
            style: "list.css", 
            listTitle: titulo,
            search: search
        })
    },
    search: async (req, res) => {
        let search = {
            status: false,
            category: false,
            categoryParam: undefined,
            brand: false,
            brandParam: undefined,
            query: req.query.search
        }

        let productos = await db.Product.findAll({
            include: [
                {association: "Brand"},
                {association: "Categories"}
            ]})
            .then(products => { return products })
            .catch(error => console.log(error))
        
        let busqueda = await db.Product.findAll({
            include: [
                {association: "Brand"},
                {association: "Categories"}
            ],
            where: {
                name: {[Op.like]: "%"+search.query+"%"}
            }
            })
            .then(products => { return products })
            .catch(error => console.log(error))
        
        let marcas = await db.Brand.findAll()
            .then(brands => { return brands })
            .catch(error => console.log(error));

        let categorias = await db.Category.findAll()
            .then(cat => { return cat})
            .catch(error => { console.log(error);})
    
        if (req.body.brand){
            var query = req.body.brand
        } else {
            var query = 0
        }

        if(req.query.category){
            busqueda = busqueda.filter(producto => producto.category_id == req.query.category)
        }

        res.render('product/list', {
            list: busqueda,
            brands: marcas,
            cats: categorias,
            title: "Productos",
            viewCat: "products",
            style: "list.css", 
            listTitle: "Listado de productos",
            query: query,
            search: search
        })
    }
}