import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import axios from "axios";
import { LeafletMouseEvent } from "leaflet";

import api from "../../services/api";

import "./styles.css";

import logo from "../../assets/logo.svg";

import Dropzone from "../../components/Dropzone";

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface UF {
  sigla: string;
}

interface City {
  nome: string;
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufList, setUfList] = useState<string[]>([]);
  const [cityList, setCityList] = useState<string[]>([]);

  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const [selectedUf, setSelectedUf] = useState<string>("0");
  const [selectedCity, setSelectedCity] = useState<string>("0");
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    async function loadItems() {
      const response = await api.get("items");
      console.log(response.data);
      setItems(response.data);
    }
    loadItems();
  }, []);

  useEffect(() => {
    async function loadUfs() {
      const response = await axios.get<UF[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      );

      const ufInitials = response.data.map((uf) => uf.sigla);

      console.log(ufInitials);
      setUfList(ufInitials);
    }
    loadUfs();
  }, []);

  useEffect(() => {
    if (selectedUf === "0") {
      return;
    }

    async function loadCities() {
      const response = await axios.get<City[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      );

      const cities = response.data.map((city) => city.nome);

      setCityList(cities);
    }
    loadCities();
  }, [selectedUf]);

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();
    const uf = event.target.value;

    setSelectedUf(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();
    const city = event.target.value;

    setSelectedCity(city);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleSelectItem(id: number) {
    const isSelected = selectedItemIds.findIndex((itemId) => itemId === id);

    if (isSelected >= 0) {
      const filteredItems = selectedItemIds.filter((itemId) => itemId !== id);

      setSelectedItemIds(filteredItems);
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItemIds;

    const data = new FormData();

    data.append("name", name);
    data.append("email", email);
    data.append("whatsapp", whatsapp);
    data.append("uf", uf);
    data.append("city", city);
    data.append("latitude", String(latitude));
    data.append("longitude", String(longitude));
    data.append("items", items.join(","));

    if (selectedFile) {
      data.append("image", selectedFile);
    }

    await api.post("points", data);

    alert("Ponto de coleta cadastrado com sucesso");

    history.push("/");
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br />
          ponto de coleta
        </h1>

        <Dropzone onFileUpload={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whataspp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map
            center={
              //[-17.8036336, -50.9138816],
              initialPosition
            }
            zoom={15}
            onClick={handleMapClick}
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                onChange={handleSelectUf}
                value={selectedUf}
              >
                <option value="0">Selecione uma UF</option>
                {ufList.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                onChange={handleSelectCity}
                value={selectedCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cityList.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItemIds.includes(item.id) ? "selected" : ""}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
