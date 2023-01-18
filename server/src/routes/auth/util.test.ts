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
            '0a2412c1b724c1ff462e66d88c545988403c6548fe12a62074e178fb57a19931',
            '8d518fab7749129f6660246be8620296221f9fe0db28c3ba6ec8af9543bb7d94',
            '8bc5d53d6adc957ac366fb31105e1d3e0c4c93f8c3e505457f9d40e5b814a8c1',
            '62171342122bfd86aeff73cfda7d75fdd055e67fb7f929c6244caf35b20c7ca5',
            'cb46043d0120b32afe8a2972c86639b696da61c51c3d70a1e2fd1c3838cfbe2c',
        ]);
    },
});
