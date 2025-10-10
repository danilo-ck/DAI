import mongoose from 'mongoose';
import Producto from './model/Producto.js';
import connectDB from './model/db.js';

await connectDB();

console.log('--- Productos de menos de 1 € ---');
let productos = await Producto.find({ precio_euros: { $lt: 1 } });
productos.forEach(p => console.log(p.texto_1, '-', p.precio_euros, '€'));

console.log('\n--- Productos de menos de 1 € que no sean agua ---');
productos = await Producto.find({ precio_euros: { $lt: 1 }, texto_1: { $not: /agua/i } });
productos.forEach(p => console.log(p.texto_1, '-', p.precio_euros, '€'));

console.log('\n--- Aceites ordenados por precio ---');
productos = await Producto.find({ subcategoría: /aceite/i }).sort({ precio_euros: 1 });
productos.forEach(p => console.log(p.texto_1, '-', p.precio_euros, '€'));

console.log('\n--- Productos en garrafa ---');
productos = await Producto.find({ texto_2: /garrafa/i });
productos.forEach(p => console.log(p.texto_1, '-', p.texto_2, '-', p.precio_euros, '€'));

await mongoose.connection.close();
