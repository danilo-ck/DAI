import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
	categoría: {
		type: String,
		required: true,
		trim: true,
	},
	subcategoría: {
		type: String,
		required: true,
		trim: true,
	},
	url_img: {
		type: String,
		required: true,
		trim: true,
	},
	texto_1: {
		type: String,
		required: true,
		trim: true,
	},
	texto_2: {
		type: String,
		required: true,
		trim: true,
	},
	texto_precio: {
		type: String,
		required: true,
		trim: true,
	},
	precio_euros: {
		type: Number,
		required: true,
		min: 0,
	}
})
const Producto = mongoose.model('Producto', productoSchema);
export default Producto