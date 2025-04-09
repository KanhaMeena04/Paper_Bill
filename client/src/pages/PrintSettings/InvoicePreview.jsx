import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getBusinessProfile } from "../../Redux/userSlice";

const InvoicePreview = ({ invoiceData }) => {
  const { profile } = useSelector((state) => state.auth);
  const [email, setEmail] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
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
    dispatch(getBusinessProfile(email));
  }, [email, dispatch]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white">
      <div className="border">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600">LOGO</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {invoiceData.companyName}
              </h1>
              <p className="text-sm text-gray-600">
                Phone: {invoiceData.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Company and Invoice Details */}
        <div className="grid grid-cols-2 gap-0">
          <div className="p-4 border-r border-b">
            <h2 className="text-sm font-semibold mb-2">Bill To:</h2>
            <p className="text-sm">{invoiceData.billTo?.name}</p>
            <p className="text-sm">State: {invoiceData.billTo?.state}</p>
          </div>
          <div className="p-4 border-b">
            <h2 className="text-sm font-semibold mb-2">Invoice Details:</h2>
            <p className="text-sm">
              No: {invoiceData.invoiceDetails?.invoiceNo}
            </p>
            <p className="text-sm">Date: {invoiceData.invoiceDetails?.date}</p>
            <p className="text-sm">
              Place Of Supply: {invoiceData.invoiceDetails?.placeOfSupply}
            </p>
          </div>
        </div>

        {invoiceData.transportationDetails && (
          <div className="w-full border-b">
            <div className="p-4">
              <h2 className="text-sm font-semibold mb-2">
                Transportation Details:
              </h2>
              <div className="space-y-1">
                {invoiceData?.transportationDetails?.map((detail, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">
                      {detail.name}:
                    </span>
                    <span className="ml-1">{detail.inputValue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Merged Items and Tax Table */}
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left border-b border-r">#</th>
              <th className="p-2 text-left border-b border-r">Item name</th>
              <th className="p-2 text-left border-b border-r">HSN/SAC</th>
              <th className="p-2 text-right border-b border-r">Quantity</th>
              <th className="p-2 text-right border-b border-r">
                Price/Unit {profile?.currencySymbol}
              </th>
              <th className="p-2 text-right border-b border-r">
                Discount {profile?.currencySymbol}
              </th>
              <th className="p-2 text-right border-b border-r">
                Taxable Amount {profile?.currencySymbol}
              </th>
              <th className="p-2 text-center border-b border-r" colSpan="2">
                CGST
              </th>
              <th className="p-2 text-center border-b border-r" colSpan="2">
                SGST
              </th>
              <th className="p-2 text-right border-b">
                Total {profile?.currencySymbol}
              </th>
            </tr>
            <tr className="bg-gray-50">
              <th className="p-2 border-b border-r" colSpan="7"></th>
              <th className="p-2 text-center border-b border-r">Rate %</th>
              <th className="p-2 text-center border-b border-r">Amount</th>
              <th className="p-2 text-center border-b border-r">Rate %</th>
              <th className="p-2 text-center border-b border-r">Amount</th>
              <th className="p-2 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items?.map((item, index) => (
              <tr key={index}>
                <td className="p-2 border-b border-r">{index + 1}</td>
                <td className="p-2 border-b border-r">{item.name}</td>
                <td className="p-2 border-b border-r">{item.hsn}</td>
                <td className="p-2 border-b border-r text-right">
                  {item.quantity}
                </td>
                <td className="p-2 border-b border-r text-right">
                  {item.pricePerUnit}
                </td>
                <td className="p-2 border-b border-r text-right">
                  {item.discount}
                </td>
                <td className="p-2 border-b border-r text-right">
                  {item.tax}
                </td>
                <td className="p-2 border-b border-r text-center">
                  {invoiceData.tax?.cgstRate}
                </td>
                <td className="p-2 border-b border-r text-right">
                  {(item.tax * (invoiceData.tax?.cgstRate / 100)).toFixed(2)}
                </td>
                <td className="p-2 border-b border-r text-center">
                  {invoiceData.tax?.sgstRate}
                </td>
                <td className="p-2 border-b border-r text-right">
                  {(item.tax * (invoiceData.tax?.sgstRate / 100)).toFixed(2)}
                </td>
                <td className="p-2 border-b text-right">{item.amount}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td colSpan="3" className="p-2 border-b border-r">
                Total
              </td>
              <td className="p-2 border-b border-r text-right">
                {invoiceData.items?.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )}
              </td>
              <td className="p-2 border-b border-r"></td>
              <td className="p-2 border-b border-r text-right">
                {invoiceData.items?.reduce(
                  (sum, item) => sum + item.discount,
                  0
                )}
              </td>
              <td className="p-2 border-b border-r text-right">
                {invoiceData.items?.reduce((sum, item) => sum + item.tax, 0)}
              </td>
              <td className="p-2 border-b border-r text-center">
                {invoiceData.tax?.cgstRate}
              </td>
              <td className="p-2 border-b border-r text-right">
                {invoiceData.tax?.cgstAmount}
              </td>
              <td className="p-2 border-b border-r text-center">
                {invoiceData.tax?.sgstRate}
              </td>
              <td className="p-2 border-b border-r text-right">
                {invoiceData.tax?.sgstAmount}
              </td>
              <td className="p-2 border-b text-right">
                {invoiceData.items?.reduce((sum, item) => sum + item.amount, 0)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Summary Section */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">
                Invoice Amount in Words:
              </h3>
              <p className="text-sm">{invoiceData.summary?.totalAmountInWords}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sub Total</span>
                <span>
                  {profile?.currencySymbol}{" "}
                  {invoiceData.summary?.totalAmount -
                    (invoiceData.additionalCharges?.reduce(
                      (acc, charge) => acc + (Number(charge.totalWithTax) || 0),
                      0
                    ) || 0)}
                </span>
              </div>

              {invoiceData?.additionalCharges?.map((charge, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{charge.name}</span>
                  <span>
                    {profile?.currencySymbol} {charge.value}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>
                  {profile?.currencySymbol} {invoiceData.summary?.totalAmount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Received</span>
                <span>
                  {profile?.currencySymbol} {invoiceData.summary?.received || "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Balance</span>
                <span>
                  {profile?.currencySymbol} {invoiceData.summary?.balance}
                </span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>You Saved</span>
                <span>
                  {profile?.currencySymbol} {invoiceData.summary?.saved}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 border-t">
          <div className="p-4 border-r">
            <h3 className="text-sm font-semibold mb-2">Terms & Conditions:</h3>
            <p className="text-sm">{invoiceData.terms}</p>
          </div>
          <div className="p-4">
            <div className="flex flex-col items-end">
              <p className="text-sm font-semibold mb-4">
                For {invoiceData.companyName}:
              </p>
              <div className="w-40 h-20 border-b"></div>
              <p className="text-sm mt-2">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;