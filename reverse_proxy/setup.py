import os
from setuptools import find_packages, setup

PROJECT_DIR = os.path.normpath(os.path.abspath(os.path.dirname(__file__)))

# allow setup.py to be run from any path
os.chdir(PROJECT_DIR)


with open(os.path.join(PROJECT_DIR, 'README.md')) as readme:
    description = readme.read()


with open(os.path.join(PROJECT_DIR,
                       'requirements.txt')) as req_fd:
    install_requires = req_fd.readlines()


setup(
    name='reverse_proxy',
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    description=description,
    long_description=description,
    url='https://xplace.pro/',
    author='Aliaksei Sofin',
    author_email='sofin.moffin@gmail.com',
    install_requires=install_requires,
    classifiers=[
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3.5',
        'Topic :: Internet :: WWW/HTTP',
    ],
    entry_points={
        'console_scripts': [
            # 'reverse_proxy = reverse_proxy.app:cli',
        ]
    },
)
