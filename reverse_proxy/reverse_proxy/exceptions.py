class ProcessException(Exception):
    def __init__(self, command, returncode, stdout, stderr):
        self.command = command
        self.stdout = stdout
        self.stderr = stderr
        self.returncode = returncode

    def __str__(self):
        return '{}\n{}\n{}'.format(
            self.command,
            self.stdout,
            self.stderr
        )

    def __repr__(self):
        return self.__str__()

