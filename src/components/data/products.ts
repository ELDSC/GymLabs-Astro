export interface Product { //Aqui definimos lo que es un "Producto"
  id:        number;       //Tanto como su id, nombre, etc
  name:      string;
  image:     string;
  price:     number;
  oldPrice:  number;
  badge?:    string;    
  featured?: boolean;   
}

export const featuredProducts: Product[] = [ //Aqui usamos como una db local
  {
    id:       1,
    name:     'Gold Stand Whey Protein',
    image:    'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/opn/opn02414/l/53.jpg',
    price:    44.99,
    oldPrice: 59.99,
  },
  {
    id:       2,
    name:     'Creatina Monohidratada',
    image:    'https://gymbroperu.com/wp-content/uploads/2025/02/CREATINA-MONOHIDRATADA-ESSENTIALS-DRAGON-PHARMA.png',
    price:    24.99,
    oldPrice: 34.99,
    badge:    'TOP VENTAS',
    featured: true,
  },
  {
    id:       3,
    name:     'Shaker Pro Steel',
    image:    'https://http2.mlstatic.com/D_NQ_NP_643088-MPE106686552602_022026-O.webp',
    price:    12.99,
    oldPrice: 19.99,
  },
];