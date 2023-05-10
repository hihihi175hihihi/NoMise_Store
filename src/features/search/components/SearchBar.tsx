import React, { useState } from "react";
import { ProductService } from "../../products/services/ProductService";
import SearchService from "../services/SearchService";
import { productFetchResponse } from "../../products/utils/productResponse";
import { Link, useNavigate } from "react-router-dom";

type Props = {
  className: string;
};

const SearchBar: React.FC<Props> = ({ className }) => {
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<productFetchResponse[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchService = new SearchService();
  const productService = new ProductService();
  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
    setSelectedItemIndex(-1); // Reset the selected item index when input value changes
    if (inputValue) {
      const results = searchService.autoCompleteAndSuggest(inputValue);
      setSearchResults(results);
      setIsDropdownVisible(true);
    } else {
      setSearchResults([]);
      setIsDropdownVisible(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        setSelectedItemIndex((prevIndex) =>
          prevIndex <= 0 ? searchResults.length - 1 : prevIndex - 1
        );
        break;
      case "ArrowDown":
        event.preventDefault();
        setSelectedItemIndex((prevIndex) =>
          prevIndex >= searchResults.length - 1 ? 0 : prevIndex + 1
        );
        break;
      case "Enter":
        event.preventDefault();
        if (selectedItemIndex >= 0 && selectedItemIndex < searchResults.length) {
          setInputValue(searchResults[selectedItemIndex].name);
          setIsDropdownVisible(false);
        }
        break;
      case "Escape":
        event.preventDefault();
        setIsDropdownVisible(false);
        break;
    }
  };

  const handleItemClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const index = parseInt(event.currentTarget.getAttribute("data-index") || "");
    if (!isNaN(index)) {
      setInputValue(searchResults[index].name);
      setIsDropdownVisible(false);
    }
  };

  const searchProduct = () => {
    const productFetched = productService.fetchProductByName(inputValue);
    if (productFetched) {
      navigate(`/product/${productFetched.external_id}`);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Search"
        className="p-2 rounded-l-lg border-2 border-r-0 border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <button className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50" onClick={searchProduct}>
        Search
      </button>
      
      {isDropdownVisible && (
        <div className="absolute top-full left-0 w-full bg-white border-2 border-gray-400 rounded-b-lg">
          {searchResults.map((result, index) => (
            <div
              className={`px-2 py-1 cursor-pointer ${
                selectedItemIndex === index ? "bg-gray-200" : ""
              }`}
              data-index={index}
              onClick={handleItemClick}
            >
              {result.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
