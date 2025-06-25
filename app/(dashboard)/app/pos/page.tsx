"use client"; // Required for Next.js App Router client components

import React, { useState, ChangeEvent, KeyboardEvent } from 'react'; // Removed useEffect
import Image from 'next/image'; // Added for next/image
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Product, mockProducts } from './mock-data'; // Assuming mock-data.ts is in the same directory

interface CartItem extends Product {
  quantity: number;
}

const POSPage = () => {
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);

  // Product lookup logic (will be expanded in the next step)
  const handleBarcodeSubmit = () => {
    const product = mockProducts.find(p => p.barcode === barcodeInput || p.id === barcodeInput);
    if (product) {
      setFoundProduct(product);
      setCurrentQuantity(1); // Reset quantity for new product
    } else {
      setFoundProduct(null);
      // Consider adding a user notification here (e.g., using Sonner if available)
      alert('Product not found');
    }
    setBarcodeInput(''); // Clear input after search
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBarcodeInput(event.target.value);
  };

  const handleInputKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleBarcodeSubmit();
    }
  };

  // Cart management logic (will be expanded in the next step)
  const handleAddToCart = () => {
    if (!foundProduct) return;

    const existingItemIndex = cart.findIndex(item => item.id === foundProduct.id);
    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += currentQuantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...foundProduct, quantity: currentQuantity }]);
    }
    setFoundProduct(null); // Clear found product after adding
    setCurrentQuantity(1); // Reset quantity
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const handleCartItemQuantityChange = (productId: string, event: ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value, 10);
    if (!isNaN(newQuantity)) {
        handleQuantityChange(productId, Math.max(0, newQuantity));
    }
  };


  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateItemTotal = (item: CartItem) => {
    return item.price * item.quantity;
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Point of Sale</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Product Scan & Details */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan or Enter Barcode/ID</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Enter barcode or product ID"
                value={barcodeInput}
                onChange={handleInputChange}
                onKeyPress={handleInputKeyPress}
                aria-label="Barcode Input"
              />
              <Button onClick={handleBarcodeSubmit} className="w-full">
                Find Product
              </Button>
            </CardContent>
          </Card>

          {foundProduct && (
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <h3 className="text-lg font-semibold">{foundProduct.name}</h3>
                <p>Price: ${foundProduct.price.toFixed(2)}</p>
                {foundProduct.imageUrl && (
                  <div className="relative w-full h-48 rounded-md overflow-hidden my-2">
                    <Image src={foundProduct.imageUrl} alt={foundProduct.name} layout="fill" objectFit="cover" />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <label htmlFor="quantityInput" className="text-sm">Quantity:</label>
                  <Input
                    id="quantityInput"
                    type="number"
                    min="1"
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-20"
                    aria-label="Quantity to Add"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddToCart} className="w-full">
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Right Column: Cart */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4"> {/* Adjust height as needed */}
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500">Your cart is empty.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleCartItemQuantityChange(item.id, e)}
                              className="w-20 mx-auto"
                              aria-label={`Quantity for ${item.name}`}
                            />
                          </TableCell>
                          <TableCell className="text-right">${calculateItemTotal(item).toFixed(2)}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFromCart(item.id)}
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
            {cart.length > 0 && (
              <CardFooter className="flex flex-col items-end space-y-2 pt-4">
                <div className="text-xl font-semibold">
                  Total: ${calculateCartTotal().toFixed(2)}
                </div>
                <Button size="lg" className="w-full md:w-auto">
                  Proceed to Checkout (Not Implemented)
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
