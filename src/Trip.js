import React, {useState} from "react";
import Card from 'react-bootstrap/Card';
import {Button, Col, Container, Form, Row, Table} from "react-bootstrap";
import {gql, useMutation, useQuery} from "@apollo/client";


const Trip = () => {
        const [tripId, changeTripId] = useState("1")
        const [newPlace, setNewPlace] = useState("1")

        const {loading, error, data} = useQuery(TRIP_QUERY,
            {
                variables: {tripId}
            });

        const [updatePlace] = useMutation(UPDATE_PLACE, {
            refetchQueries: [
                TRIP_QUERY,
                'Trip'
            ],
        })

        const [copyTrip] = useMutation(COPY_TRIP, {
            refetchQueries: [
                TRIPS_QUERY,
                'Trips'
            ],
        })

        const {data: tripsData} = useQuery(TRIPS_QUERY)

        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error :(</p>;


        return (
            <div>
                Select trip Id
                <Form.Control className="Input" as="select" aria-label="select trip" id="floatingSelect"
                              onChange={event => changeTripId(event.target.value)}>
                    {tripsData.trips.map(trip =>
                        <option value={trip.id}>{trip.id}</option>
                    )}
                </Form.Control>

                <Form.Control className="Input" size="lg" type="text" placeholder="New place"
                              onChange={event => setNewPlace(event.target.value)}/>

                <Button className="Input" variant="primary" type="submit" onClick={() => {
                    updatePlace({
                        variables: {tripId, newPlace}
                    }).then(r => console.log(r))
                }}>
                    update place
                </Button>

                <Button className="Input" variant="primary" type="submit" onClick={() => {
                    copyTrip({
                        variables: {
                            trip:
                                {
                                    id: (Math.max(...tripsData.trips.map( trip => +trip.id)) + 1).toString(),
                                    name: data.trip.name,
                                    place: data.trip.place,
                                    description: data.trip.description,
                                    maxParticipantsCount: data.trip.maxParticipantsCount,
                                    pricePln: data.trip.pricePln,
                                    ownerId: data.trip.owner.id,
                                    participantsId: []
                                }
                        }
                    })
                }}>
                    copy trip
                </Button>

                <h2 className="Form">
                    {data.trip.name} ({data.trip.id})
                </h2>
                <Container fluid>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Info</Card.Title>

                                    <Card.Text>place : {data.trip.place}</Card.Text>
                                    <Card.Text>description : {data.trip.description}</Card.Text>
                                    <Card.Text>price : {data.trip.pricePln} zł</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Owner</Card.Title>

                                    <Card.Text>name: {data.trip.owner.firstName} {data.trip.owner.surname}</Card.Text>
                                    <Card.Text>gender: {data.trip.owner.gender.toLowerCase()}</Card.Text>
                                    <Card.Text>age: {data.trip.owner.age}</Card.Text>
                                    <Card.Text>email: {data.trip.owner.email}</Card.Text>

                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="Col">
                            <Card>
                                <Card.Body>
                                    <Card.Title>Participants</Card.Title>
                                    <Table size="sm">
                                        <thead>
                                        <tr>
                                            <th>id</th>
                                            <th>name</th>
                                            <th>gender</th>
                                            <th>age</th>
                                            <th>email</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {data.trip.participants.map(
                                            participant =>
                                                <tr>
                                                    <td>{participant.id}</td>
                                                    <td>{participant.firstName} {participant.surname}</td>
                                                    <td>{participant.gender}</td>
                                                    <td>{participant.age}</td>
                                                    <td>{participant.email}</td>
                                                </tr>)
                                        }
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
;

const TRIP_QUERY = gql`
    query Trip($tripId: ID!) {
        trip(id: $tripId) {
            __typename
            ... on Trip {
                id
                name
                place
                description
                pricePln
                owner {
                    __typename
                    ... on User {
                        id
                        firstName
                        surname
                        gender
                        age
                        email
                    }
                }
                participants(limit: 10) {
                    id
                    firstName
                    surname
                    gender
                    age
                    email
                }
            }
            ... on TripNotFound {
                notFoundId: id
            }
        }
    }
`

const TRIPS_QUERY = gql`
    query Trips {
        trips {
            id
        }
    }
`

const UPDATE_PLACE = gql`
    mutation updatePlace($tripId: ID!, $newPlace: String!) {
        updatePlace(update: {id: $tripId, place: $newPlace}) {
            tripId
        }
    }
`;


const COPY_TRIP = gql`
    mutation addTrip($trip: TripDto!) {
        addTrip(trip: $trip) {
            tripId
        }
    }
`;

export default Trip;
