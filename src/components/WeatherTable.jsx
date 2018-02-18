import React from 'react';
import { Table } from 'reactstrap';
import PropTypes from 'prop-types';

import './WeatherTable.css';

export default class WeatherTable extends React.Component {
    static propTypes = {
        masking: PropTypes.bool,
        group: PropTypes.string,
        description: PropTypes.string,
        temp: PropTypes.number,
        unit: PropTypes.string,
        listOfWeek: PropTypes.array,
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
        <Table>
            <thead>
                <tr>{this.props.listOfWeek.map(item => <th key={item.dt}>{item.weekday}</th>)}
                </tr>
            </thead>
            <tbody>
                <tr>{this.props.listOfWeek.map(item => <td key={item.dt}><i className={`owf owf-${item.weather[0].id}`}></i></td>)}</tr>
            </tbody>
        </Table>
        );
    }; 
}