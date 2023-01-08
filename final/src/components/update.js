import axios from "axios";
import React from "react";
import { Button, Container } from "react-bootstrap";
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { Link } from "react-router-dom";
import * as ml5 from "ml5";
import data from '../dataset/colorData.json';

let resultado;
let nn;

class Update extends React.Component {
    state = {
        id: "",
        RGB: "",
        R: 0,
        G: 0,
        B: 0,
        PREDICTION: "",
    }
    handleChange = (event) => {
        const value = event.target.value;
        this.setState({
            [event.target.name]: value
        });
        console.log(event.target.name + " = " + value);
    }
    componentDidMount() {
        const qId = new URLSearchParams(window.location.search).get("id");
        axios.post(`http://localhost:8080/Crud/Mostrar?id=${qId}`).then(response => {
            const question = response.data[0];
            console.info(response.data);
            this.setState({ ...question });
        }).catch(error => {
            console.info(error);
            alert(response.data.message);
        });
    }

    validar = (curId, id, RGB, R, G, B, Pred) => {
        axios.post(`http://localhost:8080/Crud/Update?curId=${curId}&id=${id}&RGB=${RGB}&R=${R}&G=${G}&B=${B}&Pred=${Pred}`).then(response => {
            console.info(response.data);
            console.log("Entro" + response);
            alert("Se actualizo con exito");
        }).finally(() => {
            window.location.href = "/Crud/";
        });
    }

    handleClick(event) {
        // Step 1: load data or create some data 

        // Step 2: set your neural network options
        const options = {
            task: 'classification',
            debug: true
        }

        // Step 3: initialize your neural network
        nn = ml5.neuralNetwork(options);

        // Step 4: add data to the neural network
        data.forEach(item => {
            const inputs = {
                r: item.r,
                g: item.g,
                b: item.b
            };
            const output = {
                color: item.label
            };

            nn.addData(inputs, output);
        });

        // Step 5: normalize your data;
        nn.normalizeData();

        // Step 6: train your neural network
        const trainingOptions = {
            epochs: 20,
            batchSize: 64
        }
        nn.train(trainingOptions, classify);
        //------------------------------------------------------


        // Step 8: make a classification



        const input = {
            r: +this.state.R,
            g: +this.state.G,
            b: +this.state.B
        }
        console.log(input.r);
        console.log(input.g);
        console.log(input.b);
        function classify() { nn.classify(input, handleResults); }


        // Step 9: define a function to handle the results of your classification
        function handleResults(error, result) {
            if (error) {
                console.error(error);
                return;
            }
            console.log(result); // {label: 'red', confidence: 0.8};
            console.log(`Color: ${result[0].label}, Seguridad de predicción: ${result[0].confidence.toFixed(2) * 100} por ciento`);
            resultado = `Color: ${result[0].label}, Seguridad de predicción: ${result[0].confidence.toFixed(2) * 100} por ciento`;
        }
    }

    render() {
        const qId = new URLSearchParams(window.location.search).get("id");
        const { R, G, B } = this.state;

        const style = {
            backgroundColor: 'rgb(' + R + ',' + G + ',' + B + ')',
            border: '1px solid black',
            height: '50px',
            width: '100%',
        };

        return (
            <div>
                <div className="container-title">
                    <h1 className="vCenter animated-text">Neural Network Color Classifier </h1>
                </div>
                <div className="container-prin">
                    <Container className="MarginContainer container-tbl">
                        <h2 className="AlignCenter mb-3" > MODIFICA TU COLOR </h2>
                        <Container>
                            <Box component="form" sx={{ '& > :not(style)': { m: 1, width: "25ch" } }}>
                                <TextField id="identificador" label="Id" variant="standard" value={this.state.id} type="number" disabled />
                                <TextField id="desc" label="Nombre" variant="standard" value={this.state.RGB} onChange={(event) => { this.setState({ RGB: event.target.value }) }} />
                                <TextField id="prediccion" label="Predicción" variant="standard" value={resultado} readOnly />
                            </Box>
                            <Box>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Box sx={{ width: "100%" }}>
                                        <div className="text-danger">Red:</div>
                                        <Slider
                                            name="R"
                                            value={R}
                                            aria-label="Red"
                                            onChange={this.handleChange}
                                            color="error"
                                            valueLabelDisplay="auto"
                                            step={1}
                                            min={0}
                                            max={255}
                                        />

                                    </Box>
                                    <Box sx={{ width: "100%" }}>
                                        <div className="text-success">Green:</div>
                                        <Slider
                                            name="G"
                                            aria-label="Green"
                                            value={G}
                                            onChange={this.handleChange}
                                            color="success"
                                            valueLabelDisplay="auto"
                                            step={1}
                                            min={0}
                                            max={255}
                                        />
                                    </Box>
                                    <Box sx={{ width: "100%" }}>
                                        <div className="text-info">Blue:</div>
                                        <Slider
                                            name="B"
                                            value={B}
                                            aria-label="Blue"
                                            onChange={this.handleChange}
                                            valueLabelDisplay="auto"
                                            color="info"
                                            step={1}
                                            min={0}
                                            max={255}
                                        />
                                    </Box>
                                </Stack>
                            </Box>
                            <div id="cuadrito" style={style}>
                            </div>
                        </Container>
                        <Button variant="light" onClick={() =>
                            this.validar(qId, document.getElementById("identificador").value, document.getElementById("desc").value, this.state.R
                                , this.state.G, this.state.B, document.getElementById("prediccion").value)}>
                            <div className="CustomLink">Modificar</div>
                        </Button>
                        <Link to="/Crud/">
                            <Button variant="light">
                                <div className="CustomLink">Regresar</div>
                            </Button>
                        </Link>
                        <Button name="PREDICTION" type="button" variant="light" onClick={this.handleClick.bind(this)}>
                            <div className="CustomLink">Neural Network</div>
                        </Button>
                        <Button name="PREDICTION" type="button" variant="light" onClick={this.handleChange}>
                            <div className="CustomLink">Cargar Resultado</div>
                        </Button>
                    </Container>
                </div>
            </div>
        )

    }
}

export default Update;