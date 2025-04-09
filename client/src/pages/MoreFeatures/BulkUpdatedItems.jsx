import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getItems, updateItems } from '../../Redux/itemSlice';

const BulkUpdatedItems = () => {
  const [activeTab, setActiveTab] = useState('pricing');
  const [updatedItems, setUpdatedItems] = useState([]);
  const {items} = useSelector((state) => state.item); // Assuming this is your Redux structure
  const dispatch = useDispatch();

  useEffect(() => {
    if (items?.length) {
      setUpdatedItems(items);
    }
  }, [items]);


  useEffect(() => {
    dispatch(getItems())
  }, [dispatch])

  const handleInputChange = (index, field, value) => {
    setUpdatedItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
      return newItems;
    });
  };

  const handleUpdate = () => {
    // Filter out items that have been modified
    const modifiedItems = updatedItems.filter((item, index) => {
      return JSON.stringify(item) !== JSON.stringify(items[index]);
    });
    
    dispatch(updateItems(modifiedItems))
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-6 flex gap-4">
        <button
          className={`px-4 py-2 rounded-full ${
            activeTab === 'pricing' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
          onClick={() => setActiveTab('pricing')}
        >
          Pricing
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            activeTab === 'stock' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
          onClick={() => setActiveTab('stock')}
        >
          Stock
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            activeTab === 'itemInfo' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
          onClick={() => setActiveTab('itemInfo')}
        >
          Item Information
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left border">#</th>
              <th className="p-3 text-left border">Item Name</th>
              <th className="p-3 text-left border">Category</th>
              <th className="p-3 text-left border">Purchase Price</th>
              <th className="p-3 text-left border">Tax Type</th>
              <th className="p-3 text-left border">Sale Price</th>
              <th className="p-3 text-left border">Tax Type</th>
              <th className="p-3 text-left border">Discount</th>
              <th className="p-3 text-left border">Discount Type</th>
              <th className="p-3 text-left border">Tax Rate</th>
            </tr>
          </thead>
          <tbody>
            {updatedItems.map((item, index) => (
              <tr key={item._id} className="border-b">
                <td className="p-3 border">{index + 1}</td>
                <td className="p-3 border">
                  <input
                    type="text"
                    className="w-full p-1 border rounded"
                    value={item.itemName || ''}
                    onChange={(e) => handleInputChange(index, 'itemName', e.target.value)}
                  />
                </td>
                <td className="p-3 border">
                  <select
                    className="w-full p-1 border rounded"
                    value={item.category || ''}
                    onChange={(e) => handleInputChange(index, 'category', e.target.value)}
                  >
                    <option value="">---</option>
                    {/* Add your categories here */}
                  </select>
                </td>
                <td className="p-3 border">
                  <input
                    type="number"
                    className="w-full p-1 border rounded"
                    value={item.purchasePrice || ''}
                    onChange={(e) => handleInputChange(index, 'purchasePrice', e.target.value)}
                  />
                </td>
                <td className="p-3 border">
                  <select
                    className="w-full p-1 border rounded"
                    value={item.taxType || 'Included'}
                    onChange={(e) => handleInputChange(index, 'taxType', e.target.value)}
                  >
                    <option value="Included">Included</option>
                    <option value="Excluded">Excluded</option>
                  </select>
                </td>
                <td className="p-3 border">
                  <input
                    type="number"
                    className="w-full p-1 border rounded"
                    value={item.salePrice || ''}
                    onChange={(e) => handleInputChange(index, 'salePrice', e.target.value)}
                  />
                </td>
                <td className="p-3 border">
                  <select
                    className="w-full p-1 border rounded"
                    value={item.salePriceTaxType || 'Included'}
                    onChange={(e) => handleInputChange(index, 'salePriceTaxType', e.target.value)}
                  >
                    <option value="Included">Included</option>
                    <option value="Excluded">Excluded</option>
                  </select>
                </td>
                <td className="p-3 border">
                  <input
                    type="number"
                    className="w-full p-1 border rounded"
                    value={item.saleDiscount || ''}
                    onChange={(e) => handleInputChange(index, 'saleDiscount', e.target.value)}
                  />
                </td>
                <td className="p-3 border">
                  <select
                    className="w-full p-1 border rounded"
                    value={item.saleDiscountType || 'Percentage'}
                    onChange={(e) => handleInputChange(index, 'saleDiscountType', e.target.value)}
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Amount">Amount</option>
                  </select>
                </td>
                <td className="p-3 border">
                  <select
                    className="w-full p-1 border rounded"
                    value={item.taxRate || 'None'}
                    onChange={(e) => handleInputChange(index, 'taxRate', e.target.value)}
                  >
                    <option value="None">None</option>
                    <option value="GST@3%">GST@3%</option>
                    <option value="GST@5%">GST@5%</option>
                    <option value="GST@12%">GST@12%</option>
                    <option value="GST@18%">GST@18%</option>
                    <option value="GST@28%">GST@28%</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Pricing - {updatedItems.length} Updates
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleUpdate}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default BulkUpdatedItems;