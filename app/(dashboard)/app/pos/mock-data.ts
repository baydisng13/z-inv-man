export interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  imageUrl?: string; // Optional image URL for products
}

export const mockProducts: Product[] = [
  {
    id: '1',
    barcode: '123456789012',
    name: 'Premium Quality Notebook',
    price: 5.99,
    imageUrl: '/images/notebook.jpg', // Example path, replace with actual if available
  },
  {
    id: '2',
    barcode: '234567890123',
    name: 'Gel Pens (Pack of 5)',
    price: 3.49,
    imageUrl: '/images/gel-pens.jpg',
  },
  {
    id: '3',
    barcode: '345678901234',
    name: 'Sticky Notes (Assorted Colors)',
    price: 2.25,
    imageUrl: '/images/sticky-notes.jpg',
  },
  {
    id: '4',
    barcode: '456789012345',
    name: 'Mechanical Pencil Set',
    price: 7.00,
    imageUrl: '/images/mech-pencil.jpg',
  },
  {
    id: '5',
    barcode: '567890123456',
    name: 'Highlighters (Set of 4)',
    price: 4.50,
    imageUrl: '/images/highlighters.jpg',
  },
  {
    id: '6',
    barcode: '678901234567',
    name: 'A4 Printer Paper (500 Sheets)',
    price: 9.99,
  },
  {
    id: '7',
    barcode: '789012345678',
    name: 'Desk Organizer',
    price: 12.75,
  },
  {
    id: '8',
    barcode: '890123456789',
    name: 'Scissors',
    price: 3.00,
  },
  {
    id: '9',
    barcode: '901234567890',
    name: 'Ruler (30cm)',
    price: 1.50,
  },
  {
    id: '10',
    barcode: '012345678901',
    name: 'Whiteboard Markers (Black, 2-pack)',
    price: 3.99,
  },
];
