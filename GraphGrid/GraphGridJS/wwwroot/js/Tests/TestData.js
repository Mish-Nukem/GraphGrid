export default class TestData {

    constructor() {
    }

    getFamily(e) {
        const res = [
            { Id: 1, ParentId: [3, 4], Name: 'Mikle', SecondName: 'Razumtsev', Date: '26/01/1979', Comment: 'Good boy' },
            { Id: 2, ParentId: [0], Name: 'Nataly', SecondName: 'Sch...', Date: '15/01/1999', Comment: 'Good girl' },
            { Id: 3, ParentId: [11, 23], Name: 'Lyuda', SecondName: 'Razumtseva', Date: '03/07/1953', Comment: 'Mommy' },
            { Id: 4, ParentId: [5, 22], Name: 'Borya', SecondName: 'Razumtsev', Date: '14/06/1953', Comment: 'Papa' },
            { Id: 5, ParentId: [0], Name: 'Nina', SecondName: 'Razumtseva', Date: '17/06/1917', Comment: 'Babushka' },
            { Id: 6, ParentId: [3, 4], Name: 'Evgenia', SecondName: 'Batyreva', Date: '31/10/1974', Comment: 'Sister' },
            { Id: 7, ParentId: [9, 10], Name: 'Ilia', SecondName: 'Razumtsev', Date: '16/09/1980', Comment: 'Brother 1' },
            { Id: 8, ParentId: [9, 10], Name: 'Mitka', SecondName: 'Razumtsev', Date: '04/07/1989', Comment: 'Brother 2' },
            { Id: 9, ParentId: [5, 22], Name: 'Kolya', SecondName: 'Razumtsev', Date: '02/11/1954', Comment: 'Dadya' },
            { Id: 10, ParentId: [11, 23], Name: 'Lara', SecondName: 'Razumtseva', Date: '31/01/1961', Comment: 'Tetya' },
            { Id: 11, ParentId: [0], Name: 'Valya', SecondName: 'Dolginova', Date: '23/06/1933', Comment: 'Babushka' },
            { Id: 12, ParentId: [6, 32], Name: 'Dashka', SecondName: 'Markelova', Date: '??/??/2000', Comment: 'Plemyannica 1' },
            { Id: 13, ParentId: [6, 32], Name: 'Katka', SecondName: 'Markelova', Date: '??/??/2003', Comment: 'Plemyannica 2' },
            { Id: 14, ParentId: [6, 31], Name: 'Tuyanka', SecondName: 'Batyreva', Date: '??/??/2010', Comment: 'Plemyannica 3' },
            { Id: 15, ParentId: [0], Name: 'Shura', SecondName: 'Pelushskaya', Date: '22/04/1919', Comment: 'Dv. Babushka' },
            { Id: 16, ParentId: [15], Name: 'Ira', SecondName: 'Pelushskaya', Date: '11/06/1947', Comment: 'Dv. Tetya' },
            { Id: 17, ParentId: [11, 23], Name: 'Sveta', SecondName: 'Dolginova', Date: '??/??/19??', Comment: 'Tetya' },
            { Id: 18, ParentId: [11, 23], Name: 'Rita', SecondName: 'Dolginova', Date: '??/??/19??', Comment: 'Tetya' },
            { Id: 19, ParentId: [11, 23], Name: 'Nadya', SecondName: 'Shaula', Date: '??/??/19??', Comment: 'Tetya' },
            { Id: 20, ParentId: [11, 23], Name: 'Vitia', SecondName: 'Dolginov', Date: '??/??/19??', Comment: 'Dadya' },
            { Id: 21, ParentId: [11, 23], Name: 'Tanya', SecondName: 'Dolginova', Date: '??/??/19??', Comment: 'Tetya' },
            { Id: 22, ParentId: [0], Name: 'Misha', SecondName: 'Razumtsev', Date: '??/??/19??', Comment: 'Ded' },
            { Id: 23, ParentId: [0], Name: 'Zambo', SecondName: 'Dolginov', Date: '??/??/19??', Comment: 'Ded 2' },

            { Id: 24, ParentId: [18, 34], Name: 'Alina', SecondName: 'Ushakova', Date: '??/??/????', Comment: 'Dv. Sister' },
            { Id: 25, ParentId: [19, 33], Name: 'Igor', SecondName: 'Shaula', Date: '??/??/????', Comment: 'Dv. Brother' },
            { Id: 26, ParentId: [19, 33], Name: 'Dima', SecondName: 'Shaula', Date: '??/??/????', Comment: 'Dv. Brother' },
            { Id: 27, ParentId: [20, 35], Name: 'Olga', SecondName: 'Dolginova', Date: '??/??/????', Comment: 'Dv. Sister' },
            { Id: 28, ParentId: [20, 35], Name: 'Venia', SecondName: 'Dolginov', Date: '??/??/????', Comment: 'Dv. Brother' },
            { Id: 29, ParentId: [20, 36], Name: 'Oleg', SecondName: 'Dolginov', Date: '??/??/????', Comment: 'Dv. Brother' },

            { Id: 30, ParentId: [0], Name: 'Yura', SecondName: 'Pelushskiy', Date: '??/??/????', Comment: 'Dv. Ded' },
            { Id: 31, ParentId: [0], Name: 'Sanal', SecondName: 'Batyrev', Date: '??/??/????', Comment: 'Muzh Sestry 3' },
            { Id: 32, ParentId: [0], Name: 'Dima', SecondName: 'Markelov', Date: '??/??/????', Comment: 'Muzh Sestry 2' },
            { Id: 33, ParentId: [0], Name: 'Slava', SecondName: 'Shaula', Date: '??/??/????', Comment: 'Muzh Teti' },
            { Id: 34, ParentId: [0], Name: 'Sasha', SecondName: 'Ushakov', Date: '??/??/????', Comment: 'Muzh Teti' },
            { Id: 35, ParentId: [0], Name: 'Toma', SecondName: '???', Date: '??/??/????', Comment: 'Mat Olgi i Veni' },
            { Id: 36, ParentId: [0], Name: 'Ira', SecondName: '???', Date: '??/??/????', Comment: 'Mat Olega' },
        ];

        //e.totalRows = res.length;

        //const page = e.pageSize > 0 && e.pageNumber > 0 ? res.slice((e.pageNumber - 1) * e.pageSize, e.pageNumber * e.pageSize) : res;

        //return page;
        return res;
    }

    getCity(e) {
        const res = [
            { Id: 1, ParentId: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], City: 'Voronezh' },
            { Id: 2, ParentId: [1, 3, 4, 5, 6, 7, 9, 10, 11, 15, 16, 17, 18, 19, 20, 21, 22, 23], City: 'Grafskaya' },
            { Id: 3, ParentId: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 23, 28, 29], City: 'Moskow' },
            { Id: 4, ParentId: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 30], City: 'Pskov' },
            { Id: 5, ParentId: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29], City: 'Elista' },
            { Id: 6, ParentId: [1, 3, 4, 6, 12, 13, 14], City: 'Pyatigorsk' },
            { Id: 7, ParentId: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16], City: 'Piter' },
            { Id: 8, ParentId: [1, 3, 4, 11, 14, 17, 18, 19, 20, 23], City: 'Novosibirsk' },
            { Id: 9, ParentId: [5, 15, 30], City: 'Ustyuzhna' },
            { Id: 10, ParentId: [1, 7, 8, 9, 20], City: 'Army' },
            { Id: 11, ParentId: [2], City: 'Bali' },
            { Id: 12, ParentId: [2], City: 'Hanty-Mansiysk' },
            { Id: 13, ParentId: [21], City: 'Paris' },
            { Id: 14, ParentId: [19, 25, 26], City: 'Energodar' },
        ];

        return res;
    }

}