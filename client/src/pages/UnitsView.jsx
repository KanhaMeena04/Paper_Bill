import React, { useEffect, useState } from "react";
import { Search, Plus, MoreVertical, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getAllPrimaryUnits, addConversion, getConversions, getItems } from "../Redux/itemSlice";
import { jwtDecode } from "jwt-decode";

const UnitsView = () => {
  const [units, setUnits] = useState([]);
  const [combinedUnits, setCombinedUnits] = useState([]);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [filteredConversions, setFilteredConversions] = useState([]);
  const [conversionData, setConversionData] = useState({
    baseUnit: "",
    rate: "",
    secondaryUnit: "",
  });

  const dispatch = useDispatch();
  const { primaryUnits, secondaryUnits, conversions } = useSelector((state) => state.item);
  const [email, setEmail] = useState(null);
  const [updatedPrimaryUnits, setUpdatedPrimaryUnits] = useState([
    { name: "BAGS" },
    { name: "BOTTLES" },
    { name: "BOX" },
    { name: "BUNDLES" },
    { name: "CANS" },
    { name: "CARTONS" },
    { name: "DOZENS" },
    { name: "GRAMMES" },
    { name: "KILOGRAMS" },
    { name: "LITRE" },
    { name: "MILLILITRE" },
    { name: "NUMBERS" },
    { name: "PACKS" },
    { name: "PAIRS" },
    { name: "PIECES" },
    { name: "QUINTAL" },
    { name: "ROLLS" },
    { name: "SQUARE FEET" },
  ]);

  const [updatedSecondaryUnits, setUpdatedSecondaryUnits] = useState([
    { name: "BAGS" },
    { name: "BOTTLES" },
    { name: "BOX" },
    { name: "BUNDLES" },
    { name: "CANS" },
    { name: "CARTONS" },
    { name: "DOZENS" },
    { name: "GRAMMES" },
    { name: "KILOGRAMS" },
    { name: "LITRE" },
    { name: "MILLILITRE" },
    { name: "NUMBERS" },
    { name: "PACKS" },
    { name: "PAIRS" },
    { name: "PIECES" },
    { name: "QUINTAL" },
    { name: "ROLLS" },
    { name: "SQUARE FEET" },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setEmail(decoded.email);
      } catch (error) {
        console.error("Error decoding token:", error.message);
      }
    }
  }, []);

  useEffect(() => {
    if (email) {
      dispatch(getAllPrimaryUnits(email));
      dispatch(getConversions(email));
    }
  }, [email, dispatch]);

    useEffect(() => {
      dispatch(getItems());
    }, [dispatch]);

  useEffect(() => {
    if (primaryUnits && secondaryUnits) {
      const allUnits = [
        ...updatedPrimaryUnits,
        ...updatedSecondaryUnits,
        ...primaryUnits,
        ...secondaryUnits,
      ];

      const uniqueUnits = allUnits.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.name === value.name)
      );

      setUnits(uniqueUnits);
      setCombinedUnits(uniqueUnits);
    }
  }, [
    primaryUnits,
    secondaryUnits,
    updatedPrimaryUnits,
    updatedSecondaryUnits,
  ]);

  useEffect(() => {
    if (selectedUnit && conversions) {
      const filtered = conversions.filter(
        (conversion) => conversion.primaryUnit === selectedUnit.name
      );
      setFilteredConversions(filtered);
    } else {
      setFilteredConversions([]);
    }
  }, [selectedUnit, conversions]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setUnits(combinedUnits);
      return;
    }

    const filtered = combinedUnits.filter(
      (unit) =>
        unit.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.shortname?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setUnits(filtered);
  };

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
  };

  const handleSaveConversion = () => {
    if (
      conversionData.baseUnit &&
      conversionData.rate &&
      conversionData.secondaryUnit
    ) {
      dispatch(addConversion({
        email,
        primaryUnit: conversionData.baseUnit,
        secondaryUnit: conversionData.secondaryUnit,
        conversionRate: conversionData.rate
      })).then(() => {
        dispatch(getConversions(email));
      });

      setShowConversionModal(false);
      setConversionData({
        baseUnit: "",
        rate: "",
        secondaryUnit: "",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-72 bg-white shadow-sm">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-md border border-gray-200 pl-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button className="mt-4 flex items-center gap-2 rounded-md bg-orange-100 text-orange-600 px-4 py-2 text-sm font-medium w-full">
            <Plus className="h-4 w-4" />
            Add Units
          </button>
        </div>

        <div className="mt-2">
          <div className="px-4 py-2 bg-gray-50 text-sm">
            <div className="flex justify-between text-gray-500 font-medium">
              <span>FULLNAME</span>
              <span>SHORTNAME</span>
            </div>
          </div>

          <div className="max-h-[375px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
            {units.map((unit, index) => (
              <div
                key={index}
                className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                  selectedUnit?.name === unit.name ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleUnitClick(unit)}
              >
                <span className="text-sm text-gray-900">{unit.name}</span>
                <div className="flex items-center gap-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-2">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Units Overview</h2>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">
                {selectedUnit ? `CONVERSIONS FOR ${selectedUnit.name}` : 'ALL UNITS'}
              </h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search units..."
                    className="rounded-md border border-gray-200 pl-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm"
                  onClick={() => setShowConversionModal(true)}
                >
                  Add Conversion
                </button>
              </div>
            </div>

            <div className="mt-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-2 font-medium w-20">#</th>
                    <th className="pb-2 font-medium">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConversions.length > 0 ? (
                    filteredConversions.map((conversion, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="py-3 text-sm text-gray-900">
                          1 {conversion.primaryUnit} = {conversion.conversionFactor} {conversion.secondaryUnit}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="2"
                        className="py-3 text-sm text-center text-gray-900"
                      >
                        No Conversions to Show
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Modal */}
      {showConversionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Add Conversion</h2>
              <button
                onClick={() => setShowConversionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex space-x-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BASE UNIT
                </label>
                <select
                  value={conversionData.baseUnit}
                  onChange={(e) =>
                    setConversionData({
                      ...conversionData,
                      baseUnit: e.target.value,
                    })
                  }
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="">Select Base Unit</option>
                  {units.map((unit, index) => (
                    <option key={index} value={unit.name}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
              <span>=</span>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  RATE
                </label>
                <input
                  type="number"
                  value={conversionData.rate}
                  onChange={(e) =>
                    setConversionData({
                      ...conversionData,
                      rate: e.target.value,
                    })
                  }
                  className="w-full border rounded-md p-2 text-sm"
                  placeholder="Enter conversion rate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SECONDARY UNIT
                </label>
                <select
                  value={conversionData.secondaryUnit}
                  onChange={(e) =>
                    setConversionData({
                      ...conversionData,
                      secondaryUnit: e.target.value,
                    })
                  }
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="">Select Secondary Unit</option>
                  {units.map((unit, index) => (
                    <option key={index} value={unit.name}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowConversionModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConversion}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitsView;