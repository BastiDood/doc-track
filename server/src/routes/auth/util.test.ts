import { assertEquals } from 'asserts';

import { hashUuid } from './util.ts';

Deno.test({
    name: 'hashUuid',
    async fn() {
        const cases = [
            '888f290f-07ff-414c-b98b-8ca40a997767',
            '8af606ae-0007-402e-a899d-8991eee69bb',
            'c95968eb-d476-499f-b592-113355360208',
            '700ecbc6-fdf9-41d6-9532-d5a742b3f41b',
            'ad984362-4b02-41ee-b877-a8949c4b8511',
        ];
        assertEquals(await Promise.all(cases.map(hashUuid)), [
            'CiQSwbckwf9GLmbYjFRZiEA8ZUj-EqYgdOF4-1ehmTE',
            'jVGPq3dJEp9mYCRr6GICliIfn-DbKMO6bsivlUO7fZQ',
            'i8XVPWrclXrDZvsxEF4dPgxMk_jD5QVFf51A5bgUqME',
            'YhcTQhIr_Yau_3PP2n11_dBV5n-3-SnGJEyvNbIMfKU',
            'y0YEPQEgsyr-iilyyGY5tpbaYcUcPXCh4v0cODjPviw',
        ]);
    },
});
