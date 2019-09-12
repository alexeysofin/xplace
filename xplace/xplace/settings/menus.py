MENU_TOP_NAV = [
    {
        "name": "Compute",
        "root": True,
        "url": "compute:containers:list",
        "submenu": [
            {
                "name": "Containers",
                "url": "compute:containers:list",
            },
            {
                "name": "Hosts",
                "url": "compute:hosts:list",
                "validators": [
                    ("menu_generator.validators.user_has_permission",
                     "compute.view_host")
                ],
            },
            {
                "name": "RAM sizes",
                "url": "compute:ram_sizes:list",
                "validators": [
                    ("menu_generator.validators.user_has_permission",
                     "compute.view_ramsize")
                ],
            },
            {
                "name": "Disk sizes",
                "url": "compute:disk_sizes:list",
                "validators": [
                    ("menu_generator.validators.user_has_permission",
                     "compute.view_disksize")
                ],
            },
            {
                "name": "Images",
                "url": "compute:images:list",
                "validators": [
                    ("menu_generator.validators.user_has_permission",
                     "compute.view_image")
                ],
            },
        ]
    },
    {
        "name": "Network",
        "root": True,
        "url": "network:domains:list",
        "submenu": [
            {
                "name": "Domains",
                "url": "network:domains:list",
            },
            {
                "name": "Reverse proxies",
                "url": "network:reverse_proxies:list",
                "validators": [
                    ("menu_generator.validators.user_has_permission",
                     "network.view_reverseproxy")
                ],
            },
        ]
    },
    {
        "name": "Users",
        "root": True,
        "url": "users:list",
        "submenu": [
            {
                "name": "Users",
                "url": "users:list",
                "validators": [
                    ("menu_generator.validators.user_has_permission",
                     "network.view_user")
                ]
            },
        ]
    },
]

MENU_ACCOUNT = [
    {
        "name": "Profile",
        "url": "account:profile",
    },
    {
        "name": "Admin",
        "url": "admin:index",
        "validators": [
            "menu_generator.validators.is_superuser"
        ],
    },
    {
        "name": "Logout",
        "url": "account:logout",
    },
]
